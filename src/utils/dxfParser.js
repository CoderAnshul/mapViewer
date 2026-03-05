export async function parseDXF(fileText) {
  try {
    const { default: DxfParser } = await import('dxf-parser');
    const parser = new DxfParser();
    const dxf = parser.parseSync(fileText);

    if (!dxf || !dxf.entities) {
      throw new Error('Invalid DXF file or no entities found');
    }

    // ── 1. Global 3D & Scale Scan ──
    let hasGlobal3D = false;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

    dxf.entities.forEach(e => {
        // Scan for 3D markers
        if (e.thickness && e.thickness > 0.1) hasGlobal3D = true;
        if (e.type === '3DFACE') hasGlobal3D = true;
        if (e.vertices) {
            e.vertices.forEach(v => { if (Math.abs(v.z || 0) > 0.1) hasGlobal3D = true; });
        }

        // Bounding box logic
        if (e.type === 'CIRCLE' || e.type === 'ARC') {
            minX = Math.min(minX, e.center.x - (e.radius || 0));
            maxX = Math.max(maxX, e.center.x + (e.radius || 0));
            minY = Math.min(minY, e.center.y - (e.radius || 0));
            maxY = Math.max(maxY, e.center.y + (e.radius || 0));
        } else if (e.type === 'LINE') {
            minX = Math.min(minX, e.start.x, e.end.x);
            maxX = Math.max(maxX, e.start.x, e.end.x);
            minY = Math.min(minY, e.start.y, e.end.y);
            maxY = Math.max(maxY, e.start.y, e.end.y);
        } else if (e.vertices || e.controlPoints) {
            const pts = e.vertices || e.controlPoints || [];
            pts.forEach(p => {
                minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
                minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
            });
        }
    });

    if (minX === Infinity) { minX = 0; maxX = 1000; minY = 0; maxY = 1000; }
    const rangeX = maxX - minX || 1;
    const rangeY = maxY - minY || 1;
    const scale = 160 / Math.max(rangeX, rangeY); 
    const offsetX = -((minX + maxX) / 2) * scale;
    const offsetZ = -((minY + maxY) / 2) * scale;

    const plots = [];
    const roads = [];
    const trees = [];
    const commonAreas = [];
    const textLabels = [];
    let plotNumCounter = 1;

    // ── Helpers ──
    const getVertices = (e) => {
      if (['LWPOLYLINE', 'POLYLINE', 'SPLINE'].includes(e.type)) {
        const pts = e.vertices || e.controlPoints || [];
        if (pts.length < 2) return null;
        return pts.map(p => [p.x * scale + offsetX, p.y * scale + offsetZ]);
      }
      if (e.type === 'LINE') {
        return [
          [e.start.x * scale + offsetX, e.start.y * scale + offsetZ],
          [e.end.x * scale + offsetX, e.end.y * scale + offsetZ]
        ];
      }
      if (e.type === '3DFACE') {
        return (e.vertices || []).map(p => [p.x * scale + offsetX, p.y * scale + offsetZ]);
      }
      if (e.type === 'CIRCLE') {
        const v = [];
        for(let i=0; i<=16; i++) {
          const a = (i/16)*Math.PI*2;
          v.push([(e.center.x + Math.cos(a)*e.radius)*scale + offsetX, (e.center.y + Math.sin(a)*e.radius)*scale + offsetZ]);
        }
        return v;
      }
      return null;
    };

    const isInside = (point, poly) => {
      let x = point[0], z = point[1], inside = false;
      for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        let xi = poly[i][0], zi = poly[i][1];
        let xj = poly[j][0], zj = poly[j][1];
        if (((zi > z) !== (zj > z)) && (x < (xj - xi) * (z - zi) / (zj - zi) + xi)) inside = !inside;
      }
      return inside;
    };

    const blocks = dxf.blocks || {};
    const getBlockEntities = (blockName) => blocks[blockName]?.entities || [];

    // ── STEP 1: Process All Entities ──
    const polygonCandidates = [];
    
    const recursiveProcess = (e, baseLayer = null) => {
      const layer = (baseLayer || e.layer || '0').toUpperCase();

      // Labels
      if (e.type === 'TEXT' || e.type === 'MTEXT') {
        const tx = (e.position?.x || e.startPoint?.x || 0) * scale + offsetX;
        const tz = (e.position?.y || e.startPoint?.y || 0) * scale + offsetZ;
        textLabels.push({ text: e.text, x: tx, z: tz });
        return;
      }

      // Blocks
      if (e.type === 'INSERT' && e.name) {
        getBlockEntities(e.name).forEach(se => recursiveProcess(se, layer));
        return;
      }

      // Vertices extraction
      const v = getVertices(e);
      if (!v) return;

      const isRoad = layer.includes('ROAD') || layer.includes('STREET') || layer.includes('PATH') || layer.includes('WAY') || layer.includes('HIGHWAY') || layer.includes('RAIL') || layer.includes('DRIVE') || layer.includes('ASPHALT');
      const isWater = layer.includes('WATER') || layer.includes('RIVER') || layer.includes('LAKE') || layer.includes('CANAL');
      const isGreen = layer.includes('PARK') || layer.includes('GREEN') || layer.includes('LANDUSE') || layer.includes('VEGETATION') || layer.includes('FOREST') || layer.includes('GARDEN');
      const isBuilding = layer.includes('BUILDING') || layer.includes('BLDG') || layer.includes('STRUCT');

      // Detect Height
      let height = hasGlobal3D ? 0.35 : 0; 
      if (e.thickness && e.thickness > 0) height = e.thickness * scale;
      if (isBuilding && hasGlobal3D) height = Math.max(height, 5 * scale); // Scale 5m if 3D

      // Calculate bounding center
      let minPX = Infinity, maxPX = -Infinity, minPZ = Infinity, maxPZ = -Infinity;
      v.forEach(pt => {
        minPX = Math.min(minPX, pt[0]); maxPX = Math.max(maxPX, pt[0]);
        minPZ = Math.min(minPZ, pt[1]); maxPZ = Math.max(maxPZ, pt[1]);
      });
      const cx = (minPX + maxPX)/2;
      const cz = (minPZ + maxPZ)/2;

      // Handle Lines & Polygons based on Layer
      if (v.length < 3) {
        // Only keep lines if they are roads/rails
        if (isRoad || layer.includes('RAIL')) {
           roads.push({ id: `road-line-${roads.length}`, label: 'ROAD', x: cx, z: cz, vertices: v, isLine: true });
        }
        return;
      }

      if (isRoad) {
        roads.push({ id: `road-poly-${roads.length}`, label: 'ROAD', x: cx, z: cz, vertices: v });
      } else if (isWater || isGreen || (isBuilding && !hasGlobal3D)) {
        commonAreas.push({
          id: `area-${commonAreas.length}`,
          type: isWater ? 'water' : isGreen ? 'green' : 'building',
          label: isGreen ? 'PARK' : isWater ? 'WATER' : '',
          position: [cx, 0.05, cz],
          vertices: v,
          height: height,
          color: isWater ? '#29B6F6' : isGreen ? '#2E7D32' : '#d2c9b1',
        });
      } else {
        polygonCandidates.push({
          vertices: v,
          center: [cx, cz],
          width: maxPX - minPX,
          depth: maxPZ - minPZ,
          height: height,
          layer: layer,
          matched: false
        });
      }
    };

    dxf.entities.forEach(e => recursiveProcess(e));

    // ── STEP 2: Match Labels ──
    textLabels.forEach(label => {
      const cleanText = label.text.replace(/\\{[^;]+;([^}]+)\\}/g, '$1').replace(/\\P/g, ' ').replace(/\\\\[A-Z][^;]*;/g, '').replace(/[\\{\\}]/g, '').trim();
      const num = parseInt(cleanText);
      if (isNaN(num)) return;

      const match = polygonCandidates.find(p => !p.matched && isInside([label.x, label.z], p.vertices));
      if (match) {
        match.matched = true;
        plots.push({
          id: `plot-${num}-${plots.length}`,
          number: num,
          area_sqm: Math.round(match.width * match.depth * 0.4),
          area_sqft: Math.round(match.width * match.depth * 0.4 * 10.764),
          status: 'available',
          vertices: match.vertices,
          center: [label.x, label.z],
          width: match.width,
          depth: match.depth,
          height: match.height
        });
      }
    });

    // ── STEP 3: Fallback ──
    polygonCandidates.forEach(p => {
      if (p.matched) return;
      const num = plotNumCounter++;
      plots.push({
        id: `plot-gen-${num}`,
        number: num,
        area_sqm: Math.round(p.width * p.depth * 0.4),
        area_sqft: Math.round(p.width * p.depth * 0.4 * 10.764),
        status: 'available',
        vertices: p.vertices,
        center: p.center,
        width: p.width,
        depth: p.depth,
        height: p.height,
        isAmenity: p.layer.includes('PARK') || p.layer.includes('GREEN')
      });
    });

    plots.sort((a, b) => a.number - b.number);
    return { plots, roads, trees, commonAreas };
  } catch (err) {
    console.error('DXF parse error:', err);
    throw err;
  }
}
