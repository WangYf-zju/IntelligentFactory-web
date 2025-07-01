import * as THREE from 'three'
import { ReactThreeFiber } from 'react-three-fiber'

declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements extends ThreeElements {
        mesh: ReactThreeFiber.Object3DNode<THREE.Mesh, typeof THREE.Mesh>
        ambientLight: ReactThreeFiber.Object3DNode<THREE.AmbientLight, typeof THREE.AmbientLight>
        pointLight: ReactThreeFiber.Object3DNode<THREE.PointLight, typeof THREE.PointLight>
        instancedMesh: ReactThreeFiber.Object3DNode<THREE.InstancedMesh, typeof THREE.InstancedMesh>
      }
    }
  }
}