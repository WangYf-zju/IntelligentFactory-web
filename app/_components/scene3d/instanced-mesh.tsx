import { ReactNode, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { extend } from '@react-three/fiber';

extend({ InstancedMesh: THREE.InstancedMesh });

interface InstancedMeshProps {
  matrix: THREE.Matrix4[];
  geometry: THREE.BufferGeometry,
  material?: THREE.Material;
}

export default function InstancedMesh(props: InstancedMeshProps) {
  const { matrix, geometry, material } = props;
  const ref = useRef<THREE.InstancedMesh<THREE.BufferGeometry, THREE.Material>>(null);
  const count = matrix.length;
  useEffect(() => {
    if (ref.current) {
      for (let i = 0; i < count; i++) {
        ref.current.setMatrixAt(i, matrix[i]);
      }
      const oldCount = ref.current.count;
      if (oldCount < count) {
        for (let i = count; i < oldCount; i++) {
          const matrix = new THREE.Matrix4().identity();
          ref.current.setMatrixAt(i, matrix);
        }
      }
      ref.current.count = count;
      ref.current.instanceMatrix.needsUpdate = true;
    }
  }, [matrix]);

  return (
    <>
      {count > 0 && <instancedMesh ref={ref} args={[geometry, material, count]} />}
    </>
  );
}