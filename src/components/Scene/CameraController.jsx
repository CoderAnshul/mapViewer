import { useRef, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import usePlotStore from '../../store/plotStore';

const CAMERA_3D = {
  position: new THREE.Vector3(30, 120, 110),
  target: new THREE.Vector3(30, 0, -20),
};

const CAMERA_2D = {
  position: new THREE.Vector3(30, 200, 0.001),
  target: new THREE.Vector3(30, 0, -20),
};

export default function CameraController() {
  const { camera } = useThree();
  const controlsRef = useRef();
  const targetPos = useRef(new THREE.Vector3().copy(CAMERA_3D.position));
  const targetLookAt = useRef(new THREE.Vector3().copy(CAMERA_3D.target));
  const currentLookAt = useRef(new THREE.Vector3().copy(CAMERA_3D.target));
  const animating = useRef(false);

  const cameraTarget = usePlotStore((s) => s.cameraTarget);
  const viewMode = usePlotStore((s) => s.viewMode);
  const resetCamera = usePlotStore((s) => s.resetCamera);
  const clearReset = usePlotStore((s) => s.clearReset);

  // Set initial camera
  useEffect(() => {
    camera.position.copy(CAMERA_3D.position);
    camera.lookAt(CAMERA_3D.target);
    if (controlsRef.current) {
      controlsRef.current.target.copy(CAMERA_3D.target);
      controlsRef.current.update();
    }
  }, []);

  // React to cameraTarget change (plot click)
  useEffect(() => {
    if (cameraTarget && controlsRef.current) {
      const { position, lookAt } = cameraTarget;
      
      // Disable controls during automated flight to prevent "off-centering"
      controlsRef.current.enabled = false;

      gsap.to(camera.position, {
        x: position[0],
        y: position[1],
        z: position[2],
        duration: 0.8,
        ease: "expo.out"
      });

      gsap.to(controlsRef.current.target, {
        x: lookAt[0],
        y: 0.5, // Force focus to be slightly above ground level
        z: lookAt[2],
        duration: 0.8,
        ease: "expo.out",
        onUpdate: () => controlsRef.current.update(),
        onComplete: () => {
          if (controlsRef.current) {
            controlsRef.current.enabled = true;
            controlsRef.current.update();
          }
        }
      });
    }
  }, [cameraTarget, camera, controlsRef]);

  // React to view mode change
  useEffect(() => {
    const cam = viewMode === '2D' ? CAMERA_2D : CAMERA_3D;
    
    gsap.to(camera.position, {
      x: cam.position.x,
      y: cam.position.y,
      z: cam.position.z,
      duration: 1.5,
      ease: "power3.inOut"
    });

    if (controlsRef.current) {
      gsap.to(controlsRef.current.target, {
        x: cam.target.x,
        y: cam.target.y,
        z: cam.target.z,
        duration: 1.5,
        ease: "power3.inOut",
        onUpdate: () => controlsRef.current.update()
      });
    }
  }, [viewMode, camera, controlsRef]);

  // React to reset
  useEffect(() => {
    if (resetCamera) {
      const cam = viewMode === '2D' ? CAMERA_2D : CAMERA_3D;
      
      gsap.to(camera.position, {
        x: cam.position.x,
        y: cam.position.y,
        z: cam.position.z,
        duration: 1.5,
        ease: "power3.inOut"
      });

      if (controlsRef.current) {
        gsap.to(controlsRef.current.target, {
          x: cam.target.x,
          y: cam.target.y,
          z: cam.target.z,
          duration: 1.5,
          ease: "power3.inOut",
          onUpdate: () => controlsRef.current.update()
        });
      }
      clearReset();
    }
  }, [resetCamera, viewMode, camera, controlsRef, clearReset]);

  useFrame(() => {
    if (controlsRef.current?.enabled) {
      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.08}
      rotateSpeed={0.6}
      zoomSpeed={1.2}
      panSpeed={1.2}
      minDistance={10}
      maxDistance={400}
      minPolarAngle={0}
      maxPolarAngle={viewMode === '2D' ? 0 : Math.PI / 2.1}
      makeDefault
      // map-like interaction: LEFT CLICK should PAN (DRAG), RIGHT CLICK should ROTATE
      mouseButtons={{
        LEFT: THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN,
      }}
      touches={{
        ONE: THREE.TOUCH.ROTATE,
        TWO: THREE.TOUCH.DOLLY_PAN
      }}
      enableRotate={true}
    />
  );
}
