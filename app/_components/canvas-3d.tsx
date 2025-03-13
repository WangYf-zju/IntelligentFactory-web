import { useEffect } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import Factory from '@comp/scene3d/factory';
import { useGlobalState } from '@comp/global-state';

// components/LoadingMask.js
const LoadingMask = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
};

function Canvas3d() {
  const { state } = useGlobalState();
  return (
    <>
      <Canvas>
        <PerspectiveCamera makeDefault up={[0, 0, 1]} position={[5, 5, 5]} fov={20} />
        <OrbitControls mouseButtons={{ LEFT: THREE.MOUSE.PAN, MIDDLE: THREE.MOUSE.ROTATE }} />
        <Factory />
        <ambientLight intensity={1} />
        <directionalLight color="white" position={[0.5, 0.5, 0.5]} intensity={0.5} />
        <directionalLight color="white" position={[0.5, -0.5, 0.5]} intensity={0.7} />
        <directionalLight color="white" position={[-0.5, -0.5, 0.5]} intensity={0.6} />
      </Canvas>
    </>
  );
}

export default Canvas3d;