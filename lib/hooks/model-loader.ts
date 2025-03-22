import { useLoader } from '@react-three/fiber';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';

export function useOBJLoader(OBJPath: string, MTLPath: string) {
  const materials = useLoader(MTLLoader, MTLPath);
  const model = useLoader(OBJLoader, OBJPath, (loader) => {
    materials.preload();
    loader.setMaterials(materials!);
  });
  return model;
};