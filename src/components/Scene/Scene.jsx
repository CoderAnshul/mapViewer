import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import CameraController from './CameraController';
import PlotsLayer from './PlotsLayer';
import Roads from './Roads';
import CommonAreas from './CommonAreas';
import usePlotStore from '../../store/plotStore';

// Infinite ground
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.25, 0]} receiveShadow>
      <planeGeometry args={[1000, 1000]} />
      <meshStandardMaterial color="#181818" roughness={0.98} metalness={0.0} />
    </mesh>
  );
}

// Site base slab — slightly lighter than ground, defines the colony footprint
function SiteBase() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.12, 0]} receiveShadow>
      <planeGeometry args={[500, 500]} />
      <meshStandardMaterial color="#1d1d1d" roughness={0.95} />
    </mesh>
  );
}

export default function Scene() {
  const selectPlot = usePlotStore((s) => s.selectPlot);
  
  // Get layout data from store (set by Admin or defaults)
  const roads = usePlotStore((s) => s.roads);
  const commonAreas = usePlotStore((s) => s.commonAreas);
  const treePositions = usePlotStore((s) => s.treePositions);

  return (
    <Canvas
      shadows
      camera={{
        fov: 52,
        near: 0.5,
        far: 2000,
        position: [0, 120, 110], 
      }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 0.9,
        outputColorSpace: THREE.SRGBColorSpace,
        powerPreference: "high-performance",
        stencil: false,
      }}
      onPointerMissed={() => selectPlot(null)}
      style={{ background: '#111111' }}
    >
      {/* ── Lighting ── */}
      <directionalLight
        position={[80, 130, 60]}
        intensity={1.5}
        color="#fff5e0"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={400}
        shadow-camera-left={-150}
        shadow-camera-right={150}
        shadow-camera-top={150}
        shadow-camera-bottom={-150}
        shadow-bias={-0.0005}
      />
      <ambientLight intensity={0.7} color="#ffffff" />
      <hemisphereLight skyColor="#28283c" groundColor="#0a0a0a" intensity={0.5} />

      {/* ── Atmosphere ── */}
      <fog attach="fog" args={['#111111', 250, 700]} />

      {/* ── Scene ── */}
      <Ground />
      <SiteBase />
      
      {/* Component keys ensure re-mount if data changes significantly */}
      <Roads key={`roads-${roads.length}`} roads={roads} />
      <CommonAreas key={`common-${commonAreas.length}`} areas={commonAreas} trees={treePositions} />
      <PlotsLayer />

      {/* ── Camera ── */}
      <CameraController />
    </Canvas>
  );
}
