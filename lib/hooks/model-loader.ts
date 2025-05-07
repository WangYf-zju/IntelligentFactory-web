import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { MTLLoader, OBJLoader } from 'three/examples/jsm/Addons.js';

export const loadObjModel = (OBJPath: string, MTLPath: string) => {
  const loadMTL = () =>
    new Promise<MTLLoader.MaterialCreator>((resolve, reject) =>
      new MTLLoader().load(MTLPath, resolve, () => undefined, reject));
  const loadOBJ = (materials: MTLLoader.MaterialCreator) => {
    const loader = new OBJLoader();
    loader.setMaterials(materials);
    return new Promise<THREE.Group<THREE.Object3DEventMap>>((resolve, reject) =>
      loader.load(OBJPath, resolve, () => undefined, reject));
  }
  return new Promise<[THREE.Group<THREE.Object3DEventMap>, THREE.BufferGeometry, THREE.Material | THREE.Material[]]>(
    (resolve, reject) => {
      loadMTL().then(mtl => loadOBJ(mtl)).then(m => {
        if (m.children.length > 1) {
          console.warn(`Model ${OBJPath} has more than one mesh, only the first mesh will be rendered`);
        }
        resolve([m, (m.children[0] as THREE.Mesh).geometry, (m.children[0] as THREE.Mesh).material]);
      }).catch(reject);
    });
};

export const useObjModel = (name: string) => {
  const OBJPath = `/models/${name}.obj`;
  const MTLPath = `/models/${name}.mtl`;
  const geometry = useRef<THREE.BufferGeometry>(null);
  const material = useRef<THREE.Material | THREE.Material[]>(null);
  const model = useRef<THREE.Group<THREE.Object3DEventMap>>(null);
  useEffect(() => {
    loadObjModel(OBJPath, MTLPath).then(([mdl, g, mtl]) => {
      model.current = mdl;
      geometry.current = g;
      material.current = mtl;
    }).catch(e => {
      console.log(`Cannot load model ${name}\n`, e);
    });
  }, [name]);
  return {
    model: model.current, gm:
      [geometry.current, material.current] as
      [g: THREE.BufferGeometry, m: THREE.Material | THREE.Material[]]
  };
};