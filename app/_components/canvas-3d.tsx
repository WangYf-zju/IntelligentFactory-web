import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls, Line, Stats } from '@react-three/drei';
import { Select } from 'antd';
import { useGlobalState } from '@hooks/global-state';
import { useSharedScene } from '@hooks/shared-scene';
import { useSharedState } from '@hooks/shared-state';
import { ArcTrack, LineTrack } from './scene3d/track';

interface Canvas3dProps {
  nodeId: string;
  enableControl?: boolean;
  debug?: boolean;
}

const CameraControls = ({ nodeId, enableControl, target }:
  { nodeId: string, enableControl: boolean, target?: [number, number, number] }) => {
  const { get } = useThree();
  const { dispatch, state: { scene, nodes, mouseButtonFunction: func, } } = useGlobalState();
  const [getSharedState, _] = useSharedState();
  const viewType = nodes[nodeId] ? nodes[nodeId].view.type : 'free';
  const controlsRef = useRef<OrbitControlsImpl>(null);
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
  // 设置相机信息
  useFrame((state, delta) => {
    const view = nodes[nodeId].view;
    const s = getSharedState();
    if (view && s.robots && view.type === 'follow' && view.targetId !== undefined) {
      // 跟随机器人相机偏移设置
      if (view.targetType === 'robot' && view.targetId in s.robots) {
        const camera = get().camera as THREE.PerspectiveCamera;
        const [x, y, z, r] = s.robots[view.targetId];
        const targetPos = new THREE.Vector3(x, y + 3, z - 0.5);
        // const cameraPos = targetPos.clone().add(new THREE.Vector3(-5, -5, 5));
        // camera.position.lerp(cameraPos, 0.5);
        camera.fov = 60;
        camera.position.set(x + 4, y - 3, z + 1.5);
        camera.lookAt(targetPos);
        controlsRef.current?.target.set(x, y, z);
        camera.updateProjectionMatrix();
        controlsRef.current?.update();
      }
      // TODO: 跟随设备
    }
  });
  useEffect(() => {
    if (nodeId in nodes && nodes[nodeId].needUpdateCamera) {
      const camera = get().camera as THREE.PerspectiveCamera;
      const controls = controlsRef.current;
      const info = nodes[nodeId].cameraInfo;
      if (viewType === 'top') {
        const { width: cw, height: ch } = get().size;
        const x1 = scene?.range?.x1 || 0;
        const x2 = scene?.range?.x2 || 0;
        const y1 = scene?.range?.y1 || 0;
        const y2 = scene?.range?.y2 || 0;
        const x = (x1 + x2) / 2;
        const y = (y1 + y2) / 2;
        const w = Math.abs(x1 - x2);
        const h = Math.abs(y1 - y2);
        const z = Math.max(cw, ch) * 1.2;
        const fov1 = 2 * Math.atan(h * 1.02 / (2 * z)) * 180 / Math.PI;
        const fov2 = 2 * Math.atan(w * 1.02 / (2 * z)) * 180 / Math.PI / camera.aspect;
        camera.fov = Math.max(fov1, fov2);
        camera.position.set(x, y, z);
        camera.rotation.x = Math.PI / 2;
        camera.lookAt(x, y, 0);
        controls?.target.set(x, y, 0);
      } else if (viewType === 'follow') {
        // 每帧都要更新，直接在 useFrame 中更新
      } else if (viewType === 'free') {
        camera.near = info?.near || camera.near;
        camera.far = info?.far || camera.far;
        camera.fov = info?.fov || camera.fov;
        camera.aspect = info?.aspect || camera.aspect;
        camera.zoom = info?.zoom || camera.zoom;
        camera.focus = info?.focus || camera.focus;
        info.position && camera.position.set(info.position[0], info.position[1], info.position[2]);
        info.quaternion && camera.quaternion.set(info.quaternion[0], info.quaternion[1],
          info.quaternion[2], info.quaternion[3]);
        // info.rotation && camera.rotation.set(info.rotation[0], info.rotation[1], info.rotation[2]);
        info.target && controls?.target.set(info.target[0], info.target[1], info.target[2]);
      }
      camera.updateProjectionMatrix();
      controls?.update();
      dispatch({ type: 'setNodeInfo', payload: { id: nodeId, info: { needUpdateCamera: false } } });
    }
  }, [nodes]);
  // 定时记录相机信息
  useEffect(() => {
    const camera = get().camera as THREE.PerspectiveCamera;
    const timer = setInterval(() => {
      if (!controlsRef.current) return;
      const controls = controlsRef.current;
      const info: any = {
        target: [controls.target.x, controls.target.y, controls.target.z],
        position: [camera.position.x, camera.position.y, camera.position.z],
        rotation: [camera.rotation.x, camera.rotation.y, camera.rotation.z],
        quaternion: [camera.quaternion.w, camera.quaternion.x, camera.quaternion.y, camera.quaternion.z],
        near: camera.near,
        far: camera.far,
        fov: (camera as THREE.PerspectiveCamera).fov,
        aspect: (camera as THREE.PerspectiveCamera).aspect,
        zoom: camera.zoom,
        focus: camera.focus,
      };
      dispatch({ type: 'setNodeCameraInfo', payload: { id: nodeId, info } });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const { camera, scene } = get();
    dispatch({
      type: 'setNodeInfo',
      payload: { id: nodeId, info: { camera: camera as THREE.PerspectiveCamera, scene } }
    });
  }, []);
  return (
    <>
      {
        enableControl &&
        <OrbitControls ref={controlsRef} target={target}
          mouseButtons={mouseButtons} touches={touches}
          enableRotate={viewType === 'free'} enableDamping={false} />
      }
    </>
  );
};

const FPS = () => {
  const [fps, setFps] = useState(0);
  const lastTime = useRef(performance.now());
  const frames = useRef(0);

  useFrame(() => {
    frames.current++;
    const now = performance.now();
    if (now >= lastTime.current + 1000) { // 每秒更新一次
      setFps(frames.current);
      frames.current = 0;
      lastTime.current = now;
    }
  });

  return <></>;
};

const Canvas3d = (props: Canvas3dProps) => {
  const { state: { nodes }, dispatch } = useGlobalState();
  const { nodeId, enableControl = true, debug = false } = props;
  const { target, ...camereProps } = nodes[nodeId] ? nodes[nodeId].cameraInfo : {};
  const scene = useSharedScene();
  const [getState, _] = useSharedState();
  const [view, setView] = useState<'free' | 'top' | 'follow'>('free');
  const [follow, setFollow] = useState<string>();

  const followOptions = useMemo(() => {
    if (view !== 'follow') return;
    const state = getState();
    const robots = Object.keys(state.robots).map(id => ({ value: `robot_${id}`, label: `天车 ${id}` }));
    return [
      { value: undefined, label: '无' },
      ...robots
    ];
  }, [view]);
  useEffect(() => {
    if (view === 'follow' && !follow)
      return;
    const [target_type, target_id] = follow?.split('_') as ['robot' | 'device', string]
      || [undefined, -1];
    dispatch({
      type: 'setNodeInfo', payload: {
        id: nodeId, info: {
          needUpdateCamera: true,
          view: { type: view, targetType: target_type, targetId: Number(target_id) },
        }
      }
    })
  }, [view, follow]);

  return (
    <>
      <div className="absolute left-1 top-1 z-1 space-x-2">
        {/* <span>视角</span> */}
        <span>
          <Select className="w-20" value={view} onChange={v => setView(v)}
            options={[
              { value: 'free', label: '自由' },
              { value: 'top', label: '俯视图' },
              { value: 'follow', label: '跟随' },
            ]} />
        </span>
        {view === 'follow' && <span>
          <Select className="w-20" value={follow} onChange={v => setFollow(v)}
            options={followOptions} />
        </span>}
      </div>
      <Canvas scene={scene}>
        <PerspectiveCamera
          makeDefault
          up={[0, 0, 1]}
          position={debug ? [50, 20, 200] : [50, 20, 20]}
          far={debug ? 100000 : 2000}
          {...camereProps} />

        <CameraControls {...{ nodeId, enableControl, target }} />
        {/* <LineTrack start={[0, 6, 0]} end={[3, 6, 0]} />
        <ArcTrack center={[0, 0, 0]} radius={3} angle0={0} angle1={90} dire={false} />
        <Line points={[[0, 6, 0], [3, 6, 0]]} color={0x000000}
          dashed dashSize={0.05} gapSize={0.05} lineWidth={1} />
        <Line points={points} color={0x000000}
          dashed dashSize={0.05} gapSize={0.05} lineWidth={1}/> */}
        {/* <Stats /> */}
      </Canvas>
    </>
  );
};

const points: any[] = []
const radius = 3
const segments = 32
const startAngle = 0
const endAngle = Math.PI / 2 // 270度

for (let i = 0; i <= segments; i++) {
  const angle = startAngle + (endAngle - startAngle) * (i / segments)
  points.push([Math.cos(angle) * radius, Math.sin(angle) * radius, 0])
}

export default Canvas3d;