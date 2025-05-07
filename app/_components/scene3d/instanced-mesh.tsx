import { useEffect, useRef, forwardRef, useImperativeHandle, useCallback } from 'react';
import * as THREE from 'three';
import { extend } from '@react-three/fiber';

extend({ InstancedMesh: THREE.InstancedMesh });

interface InstancedMeshProps {
  matrix: THREE.Matrix4[];
  geometry: THREE.BufferGeometry,
  material?: THREE.Material;
}

export interface InstancedMeshRef {
  updateMatrix: (m: THREE.Matrix4[]) => void;
}

const InstancedMesh = forwardRef<InstancedMeshRef, InstancedMeshProps>((props, ref) => {
  const { matrix, geometry, material } = props;
  const imRef = useRef<THREE.InstancedMesh<THREE.BufferGeometry, THREE.Material>>(null);

  const updateMatrix = useCallback((m: THREE.Matrix4[]) => {
    const count = m.length;
    if (imRef.current) {
      const oldCount = imRef.current.count;
      imRef.current.count = count;
      for (let i = 0; i < count; i++) {
        imRef.current.setMatrixAt(i, m[i]);
      }
      if (oldCount < count) {
        for (let i = count; i < oldCount; i++) {
          const eye = new THREE.Matrix4().identity();
          imRef.current.setMatrixAt(i, eye);
        }
      }
      imRef.current.instanceMatrix.needsUpdate = true;
    }
  }, []);

  useImperativeHandle(ref, () => ({
    updateMatrix,
  }));

  useEffect(() => {
    updateMatrix(matrix);
  }, [matrix]);

  return (
    <>
      <instancedMesh ref={imRef} args={[geometry, material, matrix.length]} />
    </>
  );
});

export const useInstancedMesh = (geometry: THREE.BufferGeometry,
  material: THREE.Material | THREE.Material[]) => {
  const instancedMesh = useRef<THREE.InstancedMesh>(null);
  const count = useRef(0);
  const update = useCallback((scene: THREE.Scene, matrix: THREE.Matrix4[]) => {
    if (matrix.length > count.current || !instancedMesh.current) {
      instancedMesh.current && scene.remove(instancedMesh.current);
      instancedMesh.current = new THREE.InstancedMesh(geometry, material, matrix.length);
      scene.add(instancedMesh.current);
      count.current = matrix.length;
    } else {
      instancedMesh.current.count = matrix.length;
    }
    matrix.forEach((m, i) => instancedMesh.current!.setMatrixAt(i, m));
    instancedMesh.current.instanceMatrix.needsUpdate = true;
  }, [geometry, material]);
  return { update };
};

export default InstancedMesh;