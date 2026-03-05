import { useRef, useState, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import usePlotStore from '../../store/plotStore';
import { STATUS_COLORS } from '../../utils/constants';
import PlotLabel, { SurfaceLabel } from './PlotLabel';

// Create extruded geometry for arbitrary polygon (DXF imports)
function createExtrudedGeo(vertices, height = 0.35) {
  const shape = new THREE.Shape();
  shape.moveTo(vertices[0][0], vertices[0][1]);
  for (let i = 1; i < vertices.length; i++) {
    shape.lineTo(vertices[i][0], vertices[i][1]);
  }
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: height,
    bevelEnabled: false,
  });
  geo.rotateX(-Math.PI / 2);
  return geo;
}

export default function PlotMesh({ plot }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  const selectedPlot = usePlotStore((s) => s.selectedPlot);
  const showStatus = usePlotStore((s) => s.showStatus);
  const selectPlot = usePlotStore((s) => s.selectPlot);
  const setHoveredPlot = usePlotStore((s) => s.setHoveredPlot);

  const isSelected = selectedPlot?.id === plot.id;
  const isRect = plot.vertices.length === 4;

  // Plot color
  const color = useMemo(() => {
    if (isSelected) return '#1a3a6c'; // Dark Blue for selection
    if (plot.isAmenity) return '#316d2f'; // Green for gardens
    if (showStatus) return STATUS_COLORS[plot.status] || STATUS_COLORS.ninfo;
    return '#d2c9b1'; // Original Tan
  }, [isSelected, showStatus, plot.status, plot.isAmenity]);

  // Box dimensions for rectangular plots
  const boxArgs = useMemo(() => {
    if (!isRect) return null;
    const [x0, z0] = plot.vertices[0];
    const [x2, z2] = plot.vertices[2];
    return [Math.abs(x2 - x0), plot.height || 0.35, Math.abs(z2 - z0)];
  }, [plot.vertices, isRect, plot.height]);

  // Extruded geometry for DXF polygons
  const extrudedGeo = useMemo(() => {
    if (isRect) return null;
    return createExtrudedGeo(plot.vertices, plot.height || 0.35);
  }, [plot.vertices, isRect, plot.height]);

  // USE GSAP for the lift animation instead of useFrame
  useEffect(() => {
    if (!meshRef.current) return;
    const targetY = (hovered || isSelected) ? 0.35 : 0;
    gsap.to(meshRef.current.position, {
      y: targetY,
      duration: 0.4,
      ease: 'power2.out'
    });
  }, [hovered, isSelected]);

  const cx = plot.center[0];
  const cz = plot.center[1];
  const pw = plot.width ?? 5.5;
  const pd = plot.depth ?? 7.0;
  
  // Dynamic scaling logic
  const minDim = Math.min(pw, pd);
  const labelScale = Math.max(1, minDim * 0.28); 

  const handleClick = (e) => {
    e.stopPropagation();
    selectPlot(isSelected ? null : plot);
  };

  const handlePointerOver = (e) => {
    e.stopPropagation();
    setHovered(true);
    setHoveredPlot(plot.id);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    setHovered(false);
    setHoveredPlot(null);
    document.body.style.cursor = 'auto';
  };

  // Calculate rotation to align with plot orientation
  const rotationY = useMemo(() => {
    if (plot.vertices.length < 2) return 0;
    const pw = plot.width || 0;
    const pd = plot.depth || 0;
    
    if (Math.abs(pw - pd) < minDim * 0.3) return 0;

    const [x1, z1] = plot.vertices[0];
    const [x2, z2] = plot.vertices[1];
    let angle = Math.atan2(z1 - z2, x2 - x1); 
    
    if (angle > Math.PI / 2) angle -= Math.PI;
    if (angle < -Math.PI / 2) angle += Math.PI;
    
    return angle;
  }, [plot.vertices, plot.width, plot.depth, minDim]);

  const labelColor = isSelected ? '#ffffff' : showStatus ? '#ffffff' : '#2a2a2a';

  return (
    <group>
      {isRect ? (
        <mesh
          ref={meshRef}
          position={[cx, (plot.height || 0.35) / 2, cz]}
          onClick={handleClick}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          receiveShadow
        >
          <boxGeometry args={boxArgs} />
          <meshStandardMaterial
            color={color}
            roughness={1}
            metalness={0.0}
            emissive={isSelected ? '#1a2a4d' : hovered ? '#e0e0e0' : '#000000'}
            emissiveIntensity={isSelected ? 0.3 : hovered ? 0.1 : 0}
          />
        </mesh>
      ) : (
        <mesh
          geometry={extrudedGeo}
          position={[0, 0, 0]}
          ref={meshRef}
          onClick={handleClick}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          receiveShadow
        >
          <meshStandardMaterial
            color={color}
            roughness={1}
            metalness={0.0}
            emissive={isSelected ? '#1a2a4d' : hovered ? '#e0e0e0' : '#000000'}
            emissiveIntensity={isSelected ? 0.3 : hovered ? 0.1 : 0}
          />
        </mesh>
      )}

      <SurfaceLabel
        position={[cx, 0.42, cz]}
        rotation={[-Math.PI / 2, 0, rotationY]}
        text={plot.number}
        subText={isSelected ? `${plot.area_sqm || 0} m²` : `${plot.area_sqft || 0} ft²`}
        extraText={isSelected ? `${plot.area_sqft || 0} ft²` : null}
        color={labelColor}
        opacity={isSelected || hovered ? 1 : 0.8}
        scale={isSelected ? [labelScale * 1.5, labelScale * 1.5, 1] : [labelScale, labelScale, 1]}
      />
    </group>
  );
}

