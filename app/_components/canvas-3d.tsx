import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import Factory from '@comp/scene3d/factory';
import { useGlobalState } from '@hooks/global-state';

interface Canvas3dProps {
  nodeId: string;
  enableControl?: boolean;
  debug?: boolean;
}

interface Canvas3dRef {
  camera?: THREE.PerspectiveCamera;
}

const Canvas3d = forwardRef<Canvas3dRef, Canvas3dProps>((props, ref) => {
  const { state: {
    mouseButtonFunction: func, nodes, debug: { controlTarget = undefined }
  }, dispatch } = useGlobalState();
  const { nodeId, enableControl = true, debug = false } = props;
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const camereProps = nodes[nodeId] ? nodes[nodeId].cameraInfo : {};
  // 定时记录相机信息
  useEffect(() => {
    const timer = setInterval(() => {
      if (cameraRef.current) {
        const info = {
          position: cameraRef.current.position,
          rotataion: cameraRef.current.rotation,
          zoom: cameraRef.current.zoom,
          fov: cameraRef.current.fov,
          aspect: cameraRef.current.aspect,
          near: cameraRef.current.near,
          far: cameraRef.current.far,
        };
        dispatch({ type: 'setNodeCameraInfo', payload: { id: nodeId, info } });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (cameraRef.current)
      dispatch({
        type: 'setNodeCameraInfo',
        payload: { id: nodeId, info: { camera: cameraRef.current } }
      });
  }, [cameraRef.current]);

  useImperativeHandle(ref, () => ({
    camera: cameraRef.current!,
  }));

  const mouseButtons = func === 'move' ? {
    LEFT: THREE.MOUSE.PAN,
    MIDDLE: THREE.MOUSE.ROTATE,
  } : {
    LEFT: THREE.MOUSE.ROTATE,
    MIDDLE: THREE.MOUSE.PAN,
  };
  const touches = func === 'move' ? {
    ONE: THREE.TOUCH.PAN,
    TOW: THREE.TOUCH.DOLLY_ROTATE,
  } : {
    ONE: THREE.TOUCH.ROTATE,
    TWO: THREE.TOUCH.DOLLY_PAN,
  };
  const cameraHelpers = useMemo(() => {
    if (!debug) return [];
    return Object.values(nodes)
      .filter(w => w.id != nodeId && w.cameraInfo?.camera).map((w) =>
        <cameraHelper key={w.id} args={[w.cameraInfo.camera!]} />
      );
  }, [nodes]);

  useEffect(() => { cameraRef.current?.updateMatrix(); }, [debug]);

  return (
    <>
      <Canvas>
        {cameraHelpers}
        <PerspectiveCamera ref={cameraRef}
          makeDefault
          up={[0, 0, 1]}
          position={debug ? [50, 20, 200] : [50, 20, 20]}
          far={debug ? 100000 : 2000}
          {...camereProps} />
        {
          enableControl &&
          <OrbitControls target={controlTarget}
            mouseButtons={mouseButtons} touches={touches} enableDamping={false} />
        }
        <Factory />
      </Canvas>
    </>
  );
});

export default Canvas3d;