import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useGlobalState } from '@hooks/global-state';
import { useRobotRender } from '@comp/scene3d/robot';
import { useTrackRender } from '@comp/scene3d/track';
import { useDeviceRender } from '@comp/scene3d/device';
import { useSharedScene } from '@/lib/hooks/shared-scene';
import { FactoryStatus } from '@/lib/generated_files/status_pb';

function Factory() {
  const sharedScene = useSharedScene();
  const { state: { scene } } = useGlobalState();

  return (
    <>
      {/* <ambientLight intensity={1} />
      <directionalLight color="white" position={[0.5, 0.5, 0.5]} intensity={0.5} />
      <directionalLight color="white" position={[0.5, -0.5, 0.5]} intensity={0.7} />
      <directionalLight color="white" position={[-0.5, -0.5, 0.5]} intensity={0.6} /> */}
      <primitive object={sharedScene} name='shared' />
    </>
  );
}

export const useFactoryScene = (statusGetter: (t: number) => FactoryStatus.AsObject | undefined) => {
  const robot = useRobotRender(statusGetter);
  const device = useDeviceRender();
  const track = useTrackRender();
  const { state: { scene: sceneState } } = useGlobalState();
  const needUpdate = useRef(true);
  useEffect(() => { needUpdate.current = true; }, [sceneState]);

  const init = (scene: THREE.Scene) => {
    const lights = [
      new THREE.AmbientLight('white', 1),
      new THREE.DirectionalLight('white', 0.1),
      new THREE.DirectionalLight('white', 0.1),
      new THREE.DirectionalLight('white', 0.1),
    ];
    lights[1].position.set(1, 1, 1);
    lights[2].position.set(1, -1, 1);
    lights[3].position.set(-1, -1, 1);
    scene.add(...lights);
  };

  const floorMesh = useRef<THREE.Mesh>(null);

  const frameUpdate = (scene: THREE.Scene, dt: number) => {
    if (needUpdate.current) {
      needUpdate.current = false;
      if (floorMesh.current) scene.remove(floorMesh.current);
      const [x1, x2, y1, y2] = [sceneState?.range?.x1 || 0, sceneState?.range?.x2 || 0,
      sceneState?.range?.y1 || 0, sceneState?.range?.y2 || 0];
      const [floorW, floorH] = [Math.abs(x1 - x2), Math.abs(y1 - y2)];
      const [floorX, floorY] = [(x1 + x2) / 2, (y1 + y2) / 2];
      const floorGeometry = new THREE.PlaneGeometry(floorW, floorH);
      floorGeometry.translate(floorX, floorY, 0);
      const floorMaterial = new THREE.MeshStandardMaterial({ color: '#87CEFA' })
      floorMaterial.transparent = true;
      floorMaterial.opacity = 0.5;
      floorMesh.current = new THREE.Mesh(floorGeometry, floorMaterial);
      scene.add(floorMesh.current);
    }
    track.updateFrame(scene, dt);
    device.frameUpdate(scene, dt);
    robot.frameUpdate(scene, dt);
  };
  return { init, frameUpdate };
}

export default Factory;