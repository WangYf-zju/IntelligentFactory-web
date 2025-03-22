import { } from 'react';
import { useGlobalState } from '@hooks/global-state';
import { FactoryTracks } from '@comp/scene3d/track';
import { FactoryDevices } from '@comp/scene3d/device';
import { useSharedScene } from '@/lib/hooks/shared-scene';

function Factory() {
  const sharedScene = useSharedScene();
  const { state: { scene } } = useGlobalState();

  return (
    <>
      <ambientLight intensity={1} />
      <directionalLight color="white" position={[0.5, 0.5, 0.5]} intensity={0.5} />
      <directionalLight color="white" position={[0.5, -0.5, 0.5]} intensity={0.7} />
      <directionalLight color="white" position={[-0.5, -0.5, 0.5]} intensity={0.6} />
      {scene && <FactoryTracks scene={scene} />}
      {scene && <FactoryDevices scene={scene} />}
      <primitive object={sharedScene} />
    </>
  );
}

export default Factory;