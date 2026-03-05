import { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { FlatLabel } from './PlotLabel';

// High-performance Instanced Trees
function InstancedTrees({ positions }) {
  const count = positions.length;
  const trunkRef = useRef();
  const leaf1Ref = useRef();
  const leaf2Ref = useRef();
  const leaf3Ref = useRef();

  useEffect(() => {
    if (!trunkRef.current) return;
    const tempObject = new THREE.Object3D();
    
    positions.forEach((pos, i) => {
      const [x, z] = pos;
      tempObject.position.set(x, 0, z);
      tempObject.rotation.y = Math.random() * Math.PI;
      tempObject.updateMatrix();
      
      trunkRef.current.setMatrixAt(i, tempObject.matrix);
      leaf1Ref.current.setMatrixAt(i, tempObject.matrix);
      leaf2Ref.current.setMatrixAt(i, tempObject.matrix);
      leaf3Ref.current.setMatrixAt(i, tempObject.matrix);
    });

    trunkRef.current.instanceMatrix.needsUpdate = true;
    leaf1Ref.current.instanceMatrix.needsUpdate = true;
    leaf2Ref.current.instanceMatrix.needsUpdate = true;
    leaf3Ref.current.instanceMatrix.needsUpdate = true;
  }, [positions]);

  return (
    <group>
      {/* Trunk */}
      <instancedMesh ref={trunkRef} args={[null, null, count]}>
        <cylinderGeometry args={[0.15, 0.25, 1.8, 6]} />
        <meshStandardMaterial color="#5D4037" roughness={0.9} />
      </instancedMesh>
      {/* Leaf 1 (Bottom) */}
      <instancedMesh ref={leaf1Ref} args={[null, null, count]} position={[0, 3.0, 0]}>
        <coneGeometry args={[1.3, 2.8, 7]} />
        <meshStandardMaterial color="#2E7D32" roughness={0.85} />
      </instancedMesh>
      {/* Leaf 2 (Middle) */}
      <instancedMesh ref={leaf2Ref} args={[null, null, count]} position={[0, 4.5, 0]}>
        <coneGeometry args={[0.9, 2.2, 7]} />
        <meshStandardMaterial color="#388E3C" roughness={0.8} />
      </instancedMesh>
      {/* Leaf 3 (Top) */}
      <instancedMesh ref={leaf3Ref} args={[null, null, count]} position={[0, 5.7, 0]}>
        <coneGeometry args={[0.55, 1.6, 7]} />
        <meshStandardMaterial color="#43A047" roughness={0.8} />
      </instancedMesh>
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
      {trees && trees.length > 0 && <InstancedTrees positions={trees} />}
    </group>
  );
}

function AreaPolygon({ area, color }) {
  const isWater = area.type === 'water';
  if (isWater) {
    const geo = useMemo(() => createPolygonGeo(area.vertices, 0.05), [area.vertices]);
    return (
      <mesh geometry={geo} position={[0, 0.02, 0]} receiveShadow>
        <meshStandardMaterial 
          color="#03a9f4" 
          transparent={true}
          opacity={0.4}
          roughness={0.5}
          metalness={0.1}
        />
      </mesh>
    );
  }
  
  const depth = (area.height || 0.2);
  const geo = useMemo(() => createPolygonGeo(area.vertices, depth), [area.vertices, depth]);
  return (
    <mesh geometry={geo} position={[0, 0, 0]} receiveShadow castShadow={area.type === 'building'}>
      <meshStandardMaterial 
        color={area.type === 'building' ? '#d2c9b1' : color} 
        roughness={0.8} 
        metalness={0.0}
        transparent={false}
        opacity={1}
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

