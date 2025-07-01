import { useCallback, useRef } from 'react';
import * as THREE from 'three';
import { useGlobalState } from '@hooks/global-state';
import { useFactoryTrack } from '@hooks/factory-core';
import { useObjModel } from '@hooks/model-loader';
import { useSharedState } from '@hooks/shared-state';
import useThrottle from '@hooks/throttle';
import { FactoryStatus, RobotStatus, RobotWorkState, TaskStatus } from '@/lib/generated_files/status_pb';
import { Device, FactoryScene } from '@/lib/generated_files/scene_pb';
import { useInstancedMesh } from '@comp/scene3d/instanced-mesh';
import { ArcTrackPathGeometry, LineTrackPathGeometry } from './track';

const robotOffsetZ = -0.04;
const loadingPrepareTime = 1;
const loadingOffsetZ = 1.3;
const loadingOffsetXY = 1;

const rodGeometry = new THREE.CylinderGeometry(0.02, 0.02, 1);
rodGeometry.rotateX(Math.PI / 2);
rodGeometry.translate(0, 0, -0.25 - robotOffsetZ);
const pathMaterial = new THREE.MeshBasicMaterial({ color: 'green', transparent: true, opacity: 0.5 });
const rodMaterial = new THREE.MeshBasicMaterial({ color: 'black', transparent: true, opacity: 0.8 });

type xyz = [x: number, y: number, z: number];
type AnimationPath = {
  t: number;
  offset: xyz;
  scale?: xyz;
}[];

type AnimationPathGenerator = (robot: RobotStatus.AsObject,
  task: TaskStatus.AsObject, device: Device.AsObject) => AnimationPath;

const useRobotAnimation = (generator: AnimationPathGenerator) => {
  const animations = useRef<{ [key: number]: AnimationPath }>({});

  const getOffsetScale = useCallback((t: number, path: AnimationPath) => {
    const offset: xyz = [0, 0, 0];
    const scale: xyz = [1, 1, 1];
    if (path.length > 0) {
      if (t <= path[0].t)
        return { offset: path[0].offset, scale: path[0].scale || scale };
      if (t >= path.at(-1)!.t)
        return { offset: path.at(-1)!.offset, scale: path.at(-1)!.scale || scale };
      for (let i = 0; i < path.length - 1; i++) {
        const p1 = path[i];
        const p2 = path[i + 1];
        if (t >= p1.t && t <= p2.t) {
          const percent = (t - p1.t) / (p2.t - p1.t);
          offset[0] = p1.offset[0] + (p2.offset[0] - p1.offset[0]) * percent;
          offset[1] = p1.offset[1] + (p2.offset[1] - p1.offset[1]) * percent;
          offset[2] = p1.offset[2] + (p2.offset[2] - p1.offset[2]) * percent;
          const scale1 = p1.scale || [1, 1, 1];
          const scale2 = p2.scale || [1, 1, 1];
          scale[0] = scale1[0] + (scale2[0] - scale1[0]) * percent;
          scale[1] = scale1[1] + (scale2[1] - scale1[1]) * percent;
          scale[2] = scale1[2] + (scale2[2] - scale1[2]) * percent;
          break;
        }
      }
    }
    return { offset, scale };
  }, []);

  const update = useCallback((status: FactoryStatus.AsObject,
    sceneState: FactoryScene.AsObject, robot: RobotStatus.AsObject) => {
    if (robot.state === RobotWorkState.WAITPICK || robot.state === RobotWorkState.WAITPLACE) {
      if (animations.current[robot.id] === undefined) {
        const task = status.tasksList.find(t => t.id === robot.taskId);
        const deviceId = robot.state === RobotWorkState.WAITPICK ?
          task?.pickupDevice : task?.placeDevice;
        const device = sceneState?.devicesList?.find(d => d.id === deviceId);
        if (task && device) {
          const path = generator(robot, task, device);
          animations.current[robot.id] = path;
        }
      }
    } else if (animations.current[robot.id] !== undefined) {
      delete animations.current[robot.id];
    }
  }, [generator]);

  const getPost = useCallback((robot: RobotStatus.AsObject, m0: THREE.Matrix4) => {
    const m = m0.clone();
    if (animations.current[robot.id] !== undefined) {
      const t = robot.state === RobotWorkState.WAITPLACE ?
        robot.loadingTtime - robot.loadingRtime : robot.loadingRtime;
      const { offset, scale } = getOffsetScale(t, animations.current[robot.id]);
      const m1 = new THREE.Matrix4().makeScale(...scale).makeTranslation(...offset);
      m.multiply(m1);
    }
    return m;
  }, []);
  return { animations: animations.current, update, getPost };
};

export const useRobotRender = (
  statusGetter: (t: number) => FactoryStatus.AsObject | undefined) => {
  // 加载资源
  const robotModel = useObjModel('oht-body');
  const foupModel = useObjModel('oht-foup');
  const gripperModel = useObjModel('oht-gripper');
  const robotInstancedMesh = useInstancedMesh(...robotModel.gm);
  const foupInstancedMesh = useInstancedMesh(...foupModel.gm);
  const gripperInstancedMesh = useInstancedMesh(...gripperModel.gm);
  const rodInstancedMesh = useInstancedMesh(rodGeometry, rodMaterial);
  const pulseInstancedMesh = useInstancedMesh(
    new THREE.SphereGeometry(0.5, 32, 32),
    new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.3,
    })
  );
  const foupAnimations = useRobotAnimation((robot, task, device) => {
    const r = device.rotation / 180 * Math.PI;
    const offsetX = Math.cos(r) * loadingOffsetXY;
    const offsetY = Math.sin(r) * loadingOffsetXY;
    return [
      { t: loadingPrepareTime, offset: [0, 0, 0] },                           // 1. 准备
      { t: robot.loadingTtime / 2, offset: [0, 0, -loadingOffsetZ] },         // 2. 下降
      // { t: robot.loadingTtime, offset: [offsetX, offsetY, -loadingOffsetZ] }, // 3. 平移进出机器
    ];
  });
  const gripperAnimations = useRobotAnimation((robot, task, device) => {
    return [
      { t: loadingPrepareTime, offset: [0, 0, 0] },                       // 1. 准备
      { t: robot.loadingTtime / 2, offset: [0, 0, -loadingOffsetZ] },     // 2. 下降
      { t: robot.loadingTtime - loadingPrepareTime, offset: [0, 0, 0] },  // 3. 上升
    ];
  });
  const rodAnimations = useRobotAnimation((robot, task, device) => {
    return [
      { t: 0, offset: [0, 0, robotOffsetZ], scale: [1, 1, 0] },
      { t: loadingPrepareTime, offset: [0, 0, robotOffsetZ], scale: [1, 1, 0] },
      {
        t: robot.loadingTtime / 2,
        offset: [0, 0, robotOffsetZ - loadingOffsetZ / 2],
        scale: [1, 1, -loadingOffsetZ]
      },
      {
        t: robot.loadingTtime - loadingPrepareTime,
        offset: [0, 0, robotOffsetZ],
        scale: [1, 1, 0],
      },
      { t: robot.loadingTtime, offset: [0, 0, robotOffsetZ], scale: [1, 1, 0] },
    ];
  });

  const time = useRef<number>(0);
  const pulseScale = useRef<number>(1);
  const { state: { scene: sceneState, paused, robotShowPath, robotHidePulse }, dispatch } = useGlobalState();
  const { getWorldPost } = useFactoryTrack(sceneState);
  const throttleDispatch = useThrottle(dispatch, 1000);

  // TODO: 将帧插值逻辑提取到外部，未来可能不只有机器人需要进行帧插值
  const [getSharedState, setSharedState] = useSharedState();
  const frameUpdate = (scene: THREE.Scene, dt: number) => {
    pulseScale.current += 0.01;
    if (pulseScale.current > 2)
      pulseScale.current = 1;
    if (!scene || !statusGetter || !sceneState) return;
    const status = statusGetter(paused ? time.current : time.current + dt);
    if (!status) return;
    throttleDispatch({ type: 'setStatus', payload: status });
    time.current = status.time;
    const robotMatrix: THREE.Matrix4[] = [];
    const foupMatrix: THREE.Matrix4[] = [];
    const gripperMatrix: THREE.Matrix4[] = [];
    const rodMatrix: THREE.Matrix4[] = [];
    const pulseMatrix: THREE.Matrix4[] = [];
    const robotPosts: ReturnType<typeof getSharedState>['robots'] = {};
    const tracks = getSharedState().tracks;
    const pathTracks = new Set<number>();

    // const m = new THREE.Matrix4();
    // const pos = new THREE.Vector3(8, 63.5, 3 + robotOffsetZ);
    // const quat = new THREE.Quaternion();
    // quat.setFromAxisAngle(new THREE.Vector3(0, 0, 1), -Math.PI / 2);
    // m.compose(pos, quat, new THREE.Vector3(1, 1, 1));
    // robotMatrix.push(m);
    // const pos2 = new THREE.Vector3(8, 63.5, 3 + robotOffsetZ - loadingOffsetZ);
    // const m2 = new THREE.Matrix4();
    // m2.compose(pos2, quat, new THREE.Vector3(1, 1, 1));
    // const m3 = new THREE.Matrix4();
    // const pos3 = new THREE.Vector3(8, 63.5, 3 + robotOffsetZ - loadingOffsetZ / 2);
    // const scale = new THREE.Vector3(1, 1, loadingOffsetZ);
    // m3.compose(pos3, quat, scale);
    // gripperMatrix.push(m);
    // foupMatrix.push(m);
    // // rodMatrix.push(m3);
    // robotPosts[0] = [8, 63.5, 3 + robotOffsetZ, -Math.PI / 2];

    status.robotsList.forEach((robot, index) => {
      const [x, y, z, r] = getWorldPost(robot.pos!);
      robotPosts[robot.id] = [x, y, z, r];
      const m = new THREE.Matrix4();
      const pos = new THREE.Vector3(x, y, z + robotOffsetZ);
      const quat = new THREE.Quaternion();
      quat.setFromAxisAngle(new THREE.Vector3(0, 0, 1), r);
      m.compose(pos, quat, new THREE.Vector3(1, 1, 1));
      // 判断并更新装卸动画
      foupAnimations.update(status, sceneState, robot);
      gripperAnimations.update(status, sceneState, robot);
      rodAnimations.update(status, sceneState, robot);
      robotMatrix.push(m);
      // 正在播放装卸动画/携带Foup的机器人需要渲染 foup
      if (foupAnimations.animations[robot.id] || robot.foupId !== -1) {
        foupMatrix.push(foupAnimations.getPost(robot, m));
      }
      // 正在播放装卸动画的机器人需要渲染连接杆
      if (foupAnimations.animations[robot.id]) {
        const m1 = new THREE.Matrix4();
        m1.compose(pos, new THREE.Quaternion(), new THREE.Vector3(1, 1, 1));
        rodMatrix.push(rodAnimations.getPost(robot, m1));
      }
      gripperMatrix.push(gripperAnimations.getPost(robot, m));
      const m1 = new THREE.Matrix4();
      const s = ((pulseScale.current * 100 + index) % 100) / 100 + 1;
      m1.compose(pos, quat, new THREE.Vector3(s, s, s));
      // 判断是否显示信号
      if (robotHidePulse.indexOf(robot.id) === -1)
        pulseMatrix.push(m1);
      // 判断是否显示路径
      if (robotShowPath.indexOf(robot.id) !== -1) {
        robot.pathEdges?.idsList.forEach(id => pathTracks.add(id));
      }
    });
    robotInstancedMesh.update(scene, robotMatrix);
    foupInstancedMesh.update(scene, foupMatrix);
    gripperInstancedMesh.update(scene, gripperMatrix);
    rodInstancedMesh.update(scene, rodMatrix);
    pulseInstancedMesh.update(scene, pulseMatrix);
    // 渲染路径
    renderPath(scene, tracks, pathTracks);
    // 设置共享状态
    setSharedState({ robots: robotPosts });

    // for (let obj of scene.children) {
    //   if (obj.name === "robot_model")
    //     scene.remove(obj);
    // }
    // renderOBJModels(scene, robotMatrix, robotModel.model);
    // renderOBJModels(scene, foupMatrix, foupModel.model);
    // renderOBJModels(scene, gripperMatrix, gripperModel.model);
  };

  return { frameUpdate };
};

const renderOBJModels = (scene: THREE.Scene,
  matrix: THREE.Matrix4[], model: THREE.Group<THREE.Object3DEventMap> | null) => {
  if (!model) return;
  matrix.forEach(m => {
    const modelClone = model.clone();
    modelClone.name = "robot_model";
    modelClone.applyMatrix4(m);
    scene.add(modelClone);
  });
};

const renderPath = (scene: THREE.Scene, tracks: {
  lineTracks: ReturnType<typeof useFactoryTrack>['lineTracks'];
  arcTracks: ReturnType<typeof useFactoryTrack>['arcTracks'];
}, pathTracks: Set<number>) => {
  for (let obj of scene.children) {
    if (obj.name === "path_group")
      scene.remove(obj);
  }
  const group = new THREE.Group();
  group.name = 'path_group';
  const lineTracks = tracks.lineTracks.filter(t => pathTracks.has(t.id)).map(t => {
    const g = LineTrackPathGeometry(t);
    return new THREE.Mesh(g, pathMaterial);
  });
  const arcTracks = tracks.arcTracks.filter(t => pathTracks.has(t.id)).map(t => {
    const g = ArcTrackPathGeometry(t);
    return new THREE.Mesh(g, pathMaterial);
  });
  group.add(...lineTracks);
  group.add(...arcTracks);
  scene.add(group);
};