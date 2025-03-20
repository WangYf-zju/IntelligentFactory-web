import { } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import Factory from '@comp/scene3d/factory';
import { SharedScene } from '@comp/scene3d/shared-scene';

function CameraInit() {
  return (
    <></>
  );
}

function Canvas3d() {
  return (
    <>
      <Canvas>
        <SharedScene needsUpdate />
        <PerspectiveCamera makeDefault up={[0, 0, 1]} position={[100, 20, 20]} fov={20} />
        <CameraInit />
        <OrbitControls mouseButtons={{ LEFT: THREE.MOUSE.PAN, MIDDLE: THREE.MOUSE.ROTATE }} enableDamping={false} />
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