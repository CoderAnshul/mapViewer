import { useMemo } from 'react';
import * as THREE from 'three';
import { FlatLabel } from './PlotLabel';

// Tree component
function Tree({ position }) {
  const [x, z] = position;
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.15, 0.25, 1.8, 6]} />
        <meshStandardMaterial color="#5D4037" roughness={0.9} />
      </mesh>
      <mesh position={[0, 3.0, 0]}>
        <coneGeometry args={[1.3, 2.8, 7]} />
        <meshStandardMaterial color="#2E7D32" roughness={0.85} />
      </mesh>
      <mesh position={[0, 4.5, 0]}>
        <coneGeometry args={[0.9, 2.2, 7]} />
        <meshStandardMaterial color="#388E3C" roughness={0.8} />
      </mesh>
      <mesh position={[0, 5.7, 0]}>
        <coneGeometry args={[0.55, 1.6, 7]} />
        <meshStandardMaterial color="#43A047" roughness={0.8} />
      </mesh>
    </group>
  );
}

// ── Polygon Helper ──────────────────────────────────────────────────────────
function createPolygonGeo(vertices, depth = 0.2) {
  const shape = new THREE.Shape();
  shape.moveTo(vertices[0][0], vertices[0][1]);
  for (let i = 1; i < vertices.length; i++) shape.lineTo(vertices[i][0], vertices[i][1]);
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
  geo.rotateX(-Math.PI / 2);
  return geo;
}

// ── Main logic ───────────────────────────────────────────────────────────────
export default function CommonAreas({ areas, trees }) {
  return (
    <group>
      {areas.map((area) => {
        const isPolygon = !!area.vertices;
        const color = area.color || (area.type === 'water' ? '#29B6F6' : '#2E7D32');
        
        return (
          <group key={area.id}>
            {isPolygon ? (
               <AreaPolygon area={area} color={color} />
            ) : (
               <AreaBox area={area} color={color} />
            )}
            
            {area.label && (
              <FlatLabel
                position={isPolygon ? [area.position[0], 0.35, area.position[2]] : [area.position[0], 0.35, area.position[2]]}
                rotation={[-Math.PI / 2, 0, 0]}
                text={area.label}
                color={area.type === 'building' ? '#dddddd' : '#ffffff'}
                scale={[10, 3, 1]}
              />
            )}
          </group>
        );
      })}
      {trees.map((pos, i) => (
        <Tree key={i} position={pos} />
      ))}
    </group>
  );
}

function AreaPolygon({ area, color }) {
  const depth = area.height || 0.2;
  const geo = useMemo(() => createPolygonGeo(area.vertices, depth), [area.vertices, depth]);
  return (
    <mesh geometry={geo} position={[0, 0, 0]} receiveShadow castShadow={area.type === 'building'}>
      <meshStandardMaterial 
        color={color} 
        roughness={area.type === 'water' ? 0.02 : 0.8} 
        metalness={area.type === 'water' ? 0.3 : 0}
        transparent={area.type === 'water' || area.type === 'building'}
        opacity={area.type === 'water' ? 0.85 : area.type === 'building' ? 0.82 : 1}
      />
    </mesh>
  );
}

function AreaBox({ area, color }) {
  const { position, width, depth, height } = area;
  return (
    <mesh position={[position[0], height / 2, position[2]]} receiveShadow castShadow={area.type === 'building'}>
      <boxGeometry args={[width, height, depth]} />
      <meshStandardMaterial 
        color={color} 
        roughness={area.type === 'water' ? 0.02 : 0.8} 
        metalness={area.type === 'water' ? 0.3 : 0}
        transparent={area.type === 'water' || area.type === 'building'}
        opacity={area.type === 'water' ? 0.85 : area.type === 'building' ? 0.82 : 1}
      />
    </mesh>
  );
}
