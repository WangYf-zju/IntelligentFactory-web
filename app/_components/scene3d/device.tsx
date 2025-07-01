import React, { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { FactoryScene } from '@/lib/generated_files/scene_pb';
import InstancedMesh, { useInstancedMesh } from '@comp/scene3d/instanced-mesh';
import { useObjModel } from '@/lib/hooks/model-loader';
import { useGlobalState } from '@/lib/hooks/global-state';

const material = new THREE.MeshStandardMaterial({ color: '#91caff' });

function DefaultDeviceGeometries() {
  const box1 = new THREE.BoxGeometry(4, 2.5, 1.8);
  box1.translate(-2.25, 0, 0.9);
  const box2 = new THREE.BoxGeometry(0.5, 2.5, 1);
  box2.translate(0, 0, 0.5);
  const geometries = mergeGeometries([box1, box2]);
  return geometries;
}

// TODO: 加载 OBJ 模型
const deviceGeometries: { [key: string]: THREE.BufferGeometry } = {
  "default": DefaultDeviceGeometries(),
}

const getDevicePost = (scene: FactoryScene.AsObject) => {
  const devices: { [key: string]: THREE.Matrix4[] } = {};
  for (let d of scene.devicesList) {
    const t = d.type.toLowerCase();
    const type = deviceGeometries[t] ? t : "default";
    if (devices[type] === undefined) {
      devices[type] = [];
    }
    const r = (d.rotation) / 180 * Math.PI;
    const matrix4 = new THREE.Matrix4();
    const pos = new THREE.Vector3(d.position!.x, d.position!.y, d.position!.z);
    const quat = new THREE.Quaternion();
    quat.setFromAxisAngle(new THREE.Vector3(0, 0, 1), r);
    matrix4.compose(pos, quat, new THREE.Vector3(1, 1, 1));
    devices[type].push(matrix4);
  }
  return devices;
};

export function FactoryDevices({ scene }: { scene: FactoryScene.AsObject }) {
  const devices = useMemo(() => getDevicePost(scene), [scene]);
  const instancedMeshed = React.useMemo(() => {
    return Object.keys(devices).map(type => {
      return <InstancedMesh key={type} matrix={devices[type]}
        geometry={deviceGeometries[type]} material={material} />
    });
  }, [devices]);
  return (
    <>{instancedMeshed}</>
  );
}

export const useDeviceRender = () => {
  const deviceModel = useObjModel('device');
   const { state: { scene: sceneState } } = useGlobalState();
  const deviceInstancedMesh: {[K in string]: ReturnType<typeof useInstancedMesh>} = {
    'default': useInstancedMesh(...deviceModel.gm)
  };
  const needUpdate = useRef(true);
  useEffect(() => { needUpdate.current = true; }, [sceneState]);

  const frameUpdate = (scene: THREE.Scene, dt: number) => {
    if (!needUpdate.current || !scene || !sceneState) return;
    needUpdate.current = false;
    const devices = getDevicePost(sceneState)
    Object.keys(devices).forEach(type => {
      deviceInstancedMesh[type].update(scene, devices[type]);
      // for (let obj of scene.children) {
      //   if (obj.name === "device_model")
      //     scene.remove(obj);
      // }
      renderOBJModels(scene, devices[type], deviceModel.model)
    });
  };

  return { frameUpdate };
};

const renderOBJModels = (scene: THREE.Scene,
  matrix: THREE.Matrix4[], model: THREE.Group<THREE.Object3DEventMap> | null) => {
  if (!model) return;
  matrix.forEach(m => {
    const modelClone = model.clone();
    modelClone.name = "device_model";
    modelClone.applyMatrix4(m);
    scene.add(modelClone);
  });
};