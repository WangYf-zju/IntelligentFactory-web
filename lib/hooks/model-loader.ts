import { useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';

export function useOBJLoader(objPath: string, mtlPath: string) {
  const materials = useLoader(MTLLoader, mtlPath);
  const model = useLoader(OBJLoader, objPath, (loader) => {
    materials.preload();
    loader.setMaterials(materials!);
  });
  return model;
};