import { useRef, useEffect } from 'react';
import { useThree, Camera } from '@react-three/fiber';
import * as THREE from 'three';

interface CameraControlsProps {
  dollySpeed?: number;
}

const CameraControls = (props: CameraControlsProps) => {
  const { dollySpeed: ds = 1 } = props;
  const dollySpeed = ds * 0.01;
  const { gl, get } = useThree();
  const isDragging = useRef(false);
  const isRotating = useRef(false);
  const lastMousePosition = useRef({ x: 0, y: 0 });

  const cameraOffset = (camera: Camera, deltaX: number, deltaY: number) => {
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    const direXY = new THREE.Vector2(direction.x, direction.y).normalize()
    camera.position.x += -deltaX * direXY.y + deltaY * direXY.x;
    camera.position.y += deltaX * direXY.x + deltaY * direXY.y;
  };

  const cameraRotate = (camera: Camera, deltaX: number, deltaY: number) => {
    
  };

  const handleMouseDown = (event: MouseEvent) => {
    if (event.button === 0) {
      isDragging.current = true;
    } else if (event.button === 1) {
      isRotating.current = true;
    }
    lastMousePosition.current = { x: event.clientX, y: event.clientY };
  };

  const handleMouseMove = (event: MouseEvent) => {
    const camera = get().camera;
    const deltaX = (event.clientX - lastMousePosition.current.x) * dollySpeed;
    const deltaY = (event.clientY - lastMousePosition.current.y) * dollySpeed;
    if (isDragging.current) {
      cameraOffset(camera, deltaX, deltaY);
    } else if (isRotating.current) {
      const deltaX = event.clientX - lastMousePosition.current.x;
      const angle = deltaX * 0.01;
      const axis = new THREE.Vector3(0, 0, 1);
      camera.position.applyAxisAngle(axis, angle);
      camera.lookAt(0, 0, 0);
    }
    lastMousePosition.current = { x: event.clientX, y: event.clientY };
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    isRotating.current = false;
  };

  const handleWheel = (event: WheelEvent) => {
    const camera = get().camera;
    const direction = new THREE.Vector3();
    camera.getWorldDirection(direction);
    const moveDistance = event.deltaY * dollySpeed;
    camera.position.addScaledVector(direction, moveDistance);
  };

  useEffect(() => {
    const camera = get().camera
    camera.lookAt(new THREE.Vector3(0, 0, 0))
    const canvas = gl.domElement;
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [gl.domElement]);

  return null;
};


export default CameraControls;