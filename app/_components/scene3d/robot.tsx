import { useFBX, useGLTF } from '@react-three/drei';
import { useLoader } from '@react-three/fiber';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';

interface RobotProps {
  position?: [x: number, y: number];
  rotation?: number;
}

export function Robot(props: RobotProps) {
  const { position = [14, 18], rotation = Math.PI / 2 } = props;
  // const fbx = useFBX('/models/robot.fbx');
  const materials = useLoader(MTLLoader, '/models/robot.mtl');
  const robot = useLoader(OBJLoader, '/models/robot.obj', (loader) => {
    materials.preload();
    loader.setMaterials(materials);
  });
  // const robot = useGLTF('models/robot.glb');
  return <primitive object={robot}
    position={[...position, 2.938]}
    rotation={[0, 0, rotation]}
    scale={[1, 1, 1]}
  />
}