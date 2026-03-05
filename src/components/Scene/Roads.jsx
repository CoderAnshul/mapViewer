import { useMemo } from 'react';
import * as THREE from 'three';
import { FlatLabel } from './PlotLabel';

// Helper for CAD imported roads (arbitrary polygons)
function createRoadGeo(vertices) {
  const shape = new THREE.Shape();
  shape.moveTo(vertices[0][0], vertices[0][1]);
  for (let i = 1; i < vertices.length; i++) shape.lineTo(vertices[i][0], vertices[i][1]);
  shape.closePath();
  // Roads should be flat, slightly above ground to avoid z-fighting but below plots
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.1, bevelEnabled: false });
  geo.rotateX(-Math.PI / 2);
  return geo;
}

// Helper for Line-based roads (thin strips)
function createLineRoadGeo(vertices) {
  const points = vertices.map(v => new THREE.Vector3(v[0], 0, v[1]));
  const curve = new THREE.CatmullRomCurve3(points);
  // Create a thin ribbon along the line
  const geo = new THREE.TubeGeometry(curve, vertices.length * 2, 0.4, 4, false);
  return geo;
}

export default function Roads({ roads }) {
  return (
    <group>
      {roads.map((road) => {
        const isPolygon = !!road.vertices && road.vertices.length >= 3 && !road.isLine;
        const isLine = road.isLine;
        
        const geo = useMemo(() => {
            if (isPolygon) return createRoadGeo(road.vertices);
            if (isLine) return createLineRoadGeo(road.vertices);
            return null;
        }, [road.vertices, isPolygon, isLine]);
        
        // Calculate road orientation for labels (only if we have 2+ points)
        const rotationY = useMemo(() => {
          if (!road.vertices || road.vertices.length < 2) return 0;
          const [x1, z1] = road.vertices[0];
          const [x2, z2] = road.vertices[1];
          let angle = Math.atan2(z1 - z2, x2 - x1);
          if (angle > Math.PI / 2) angle -= Math.PI;
          if (angle < -Math.PI / 2) angle += Math.PI;
          return angle;
        }, [road.vertices]);

        const roadScaleX = useMemo(() => {
          if (!road.vertices || road.vertices.length < 2) return 20;
          const [x1, z1] = road.vertices[0];
          const [x2, z2] = road.vertices[1];
          const dist = Math.sqrt((x2-x1)**2 + (z2-z1)**2);
          return Math.max(15, dist * 0.8);
        }, [road.vertices]);

        return (
          <group key={road.id}>
            {geo && (
              <mesh geometry={geo} position={[0, -0.05, 0]} receiveShadow>
                <meshStandardMaterial 
                   color="#333333" 
                   roughness={0.9} 
                   metalness={0.0} 
                   emissive="#000000" 
                />
              </mesh>
            )}

            {/* Road name label (Screenshot Stylized) */}
            {road.label && !isLine && (
              <FlatLabel
                position={isPolygon ? [road.x, 0.1, road.z] : [road.x + road.width / 2, 0.1, road.z + road.depth / 2]}
                rotation={[-Math.PI / 2, 0, rotationY]}
                text={road.label}
                color="#666666"
                scale={[roadScaleX, 5, 1]}
                opacity={0.3}
              />
            )}
          </group>
        );
      })}
    </group>
  );
}
