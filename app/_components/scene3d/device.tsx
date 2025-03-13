import React, { useMemo } from 'react';
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { FactoryScene } from '@/lib/generated_files/scene_pb';
import InstancedMesh from '@comp/scene3d/instanced-mesh';

const material = new THREE.MeshStandardMaterial({ color: '#91caff' });

function DefaultDeviceGeometries() {
  const box1 = new THREE.BoxGeometry(4, 2.5, 1.8);
  box1.translate(-2.25, 0, 0.9);
  const box2 = new THREE.BoxGeometry(0.5, 2.5, 1);
  box2.translate(0, 0, 0.5);
  const geometries = mergeGeometries([box1, box2]);
  return geometries;
}

const deviceGeometries: { [key: string]: THREE.BufferGeometry } = {
  "default": DefaultDeviceGeometries(),
}

export function FactoryDevices({ scene }: { scene: FactoryScene.AsObject }) {
  const devices = useMemo(() => {
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
    console.log(devices)
    return devices;
  }, [scene.devicesList]);
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




// const textureConfig = {
//   padding: 4,
//   color: ['#fff', '#aaa'],
//   cacheSize: [22, 18],
//   cacheY: 64,
//   cachePadding: 2.5,
//   cacheSpacing: -2,
//   cacheColor: ['#111', '#555'],
// };

// function Texture(w: number, h: number, r: number, cacheCount?: number) {
//   const {
//     padding: p, color: [c, bc],
//     cacheSize: [cw, ch], cacheY: cy, cachePadding: cp,
//     cacheSpacing: cs, cacheColor: [cc, cbc],
//   } = textureConfig;
//   const canvas = document.createElement('canvas');
//   canvas.width = w;
//   canvas.height = h;
//   const ctx = canvas.getContext('2d');
//   ctx!.fillStyle = bc;
//   ctx!.fillRect(0, 0, w, h);
//   ctx!.fillStyle = c;
//   ctx!.fillRect(p, p, w - 2 * p, h - 2 * p);
//   for (let i = 0; i < (cacheCount || 0); i++) {
//     ctx!.fillStyle = cbc;
//     ctx!.fillRect(p + i * (cw + cs), cy, cw, ch);
//     ctx!.fillStyle = cc;
//     ctx!.fillRect(p + i * (cw + cs) + cp, cy + cp, cw - 2 * cp, ch - 2 * cp);
//   }
//   const texture = new THREE.CanvasTexture(canvas);
//   if (r !== 0) {
//     texture.center.set(0.5, 0.5);
//     texture.rotation = r / 180 * Math.PI;
//   }
//   texture.needsUpdate = true;
//   return texture;
// }

// export function DeviceB(props: DeviceProps) {
//   const { cacheCount = 3 } = props;
//   const s = 128;
//   const geometry = useMemo(() => new THREE.BoxGeometry(2.5, 3.75, 2.5), []);
//   const materials = useMemo(() => {
//     const tfront = Texture(s, s, 180, cacheCount);
//     const tback = Texture(s, s, 0);
//     const tside = Texture(s, s * 1.5, 0);
//     // [x+, x-, y+, y-, z+, z-]
//     return [
//       new THREE.MeshStandardMaterial({ map: tside }),
//       new THREE.MeshStandardMaterial({ map: tside }),
//       new THREE.MeshStandardMaterial({ map: tfront }),
//       new THREE.MeshStandardMaterial({ map: tback }),
//       new THREE.MeshStandardMaterial({ map: tside }),
//       new THREE.MeshStandardMaterial({}),
//     ];
//   }, []);
//   return <mesh geometry={geometry} material={materials} />;
// }