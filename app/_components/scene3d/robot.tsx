import { useCallback, useRef } from 'react';
import * as THREE from 'three';
import { useGlobalState } from '@hooks/global-state';
import { useFactoryTrack } from '@hooks/factory-core';
import { FactoryStatus, RobotStatus, RobotWorkState, TaskStatus } from '@/lib/generated_files/status_pb';
import { Device, FactoryScene } from '@/lib/generated_files/scene_pb';
import { useObjModel } from '@/lib/hooks/model-loader';
import { useInstancedMesh } from '@comp/scene3d/instanced-mesh';

const robotOffsetZ = -0.04;
const loadingPrepareTime = 1;
const loadingOffsetZ = 1;
const loadingOffsetXY = 1;

type xyz = [x: number, y: number, z: number];
type AnimationPath = {
  t: number;
  offset: xyz;
}[];

type AnimationPathGenerator = (robot: RobotStatus.AsObject,
  task: TaskStatus.AsObject, device: Device.AsObject) => AnimationPath;

const useRobotAnimation = (generator: AnimationPathGenerator) => {
  const animations = useRef<{ [key: number]: AnimationPath }>({});

  const getOffset = useCallback((t: number, path: AnimationPath) => {
    const res: xyz = [0, 0, 0];
    if (path.length > 0) {
      if (t <= path[0].t) return path[0].offset;
      if (t >= path.at(-1)!.t) return path.at(-1)!.offset;
      for (let i = 0; i < path.length - 1; i++) {
        const p1 = path[i];
        const p2 = path[i + 1];
        if (t >= p1.t && t <= p2.t) {
          const percent = (t - p1.t) / (p2.t - p1.t);
          res[0] = p1.offset[0] + (p2.offset[0] - p1.offset[0]) * percent;
          res[1] = p1.offset[1] + (p2.offset[1] - p1.offset[1]) * percent;
          res[2] = p1.offset[2] + (p2.offset[2] - p1.offset[2]) * percent;
          break;
        }
      }
    }
    return res;
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
      const offset = getOffset(t, animations.current[robot.id]);
      const m1 = new THREE.Matrix4().makeTranslation(...offset);
      m.multiply(m1);
    }
    return m;
  }, []);
  return { animations: animations.current, update, getPost };
};

export const useRobotRender = (
  statusGetter: (t: number) => FactoryStatus.AsObject | undefined) => {
  // if (typeof window === 'undefined') { // 禁止服务端渲染
  //   return { frameUpdate: () => undefined };
  // }
  // 加载资源
  const robotModel = useObjModel('oht-body');
  const foupModel = useObjModel('oht-foup');
  const gripperModel = useObjModel('oht-gripper');
  const robotInstancedMesh = useInstancedMesh(...robotModel.gm);
  const foupInstancedMesh = useInstancedMesh(...foupModel.gm);
  const gripperInstancedMesh = useInstancedMesh(...gripperModel.gm);
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
      { t: robot.loadingTtime, offset: [offsetX, offsetY, -loadingOffsetZ] }, // 3. 平移进出机器
    ];
  });
  const gripperAnimations = useRobotAnimation((robot, task, device) => {
    return [
      { t: loadingPrepareTime, offset: [0, 0, 0] },                       // 1. 准备
      { t: robot.loadingTtime / 2, offset: [0, 0, -loadingOffsetZ] },     // 2. 下降
      { t: robot.loadingTtime - loadingPrepareTime, offset: [0, 0, 0] },  // 3. 上升
    ];
  });

  const time = useRef<number>(0);
  const pulseScale = useRef<number>(1);
  const { state: { scene: sceneState, paused } } = useGlobalState();
  const { getWorldPost } = useFactoryTrack(sceneState);

  const frameUpdate = (scene: THREE.Scene, dt: number) => {
    pulseScale.current += 0.01;
    if (pulseScale.current > 2)
      pulseScale.current = 1;
    if (!scene || !statusGetter || !sceneState) return;
    const status = statusGetter(paused ? time.current : time.current + dt);
    if (!status) return;
    time.current = status.time;
    const robotMatrix: THREE.Matrix4[] = [];
    const foupMatrix: THREE.Matrix4[] = [];
    const gripperMatrix: THREE.Matrix4[] = [];
    const pulseMatrix: THREE.Matrix4[] = [];

    const m = new THREE.Matrix4();
    const pos = new THREE.Vector3(103, 65, 3 + robotOffsetZ);
    const quat = new THREE.Quaternion();
    quat.setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2);
    m.compose(pos, quat, new THREE.Vector3(1, 1, 1));
    robotMatrix.push(m);
    gripperMatrix.push(m);
    foupMatrix.push(m);
    

    status.robotsList.forEach((robot, index) => {
      return;
      const [x, y, z, r] = getWorldPost(robot.pos!);
      const m = new THREE.Matrix4();
      const pos = new THREE.Vector3(x, y, z + robotOffsetZ);
      const quat = new THREE.Quaternion();
      quat.setFromAxisAngle(new THREE.Vector3(0, 0, 1), r);
      m.compose(pos, quat, new THREE.Vector3(1, 1, 1));
      // 判断并更新装卸动画
      foupAnimations.update(status, sceneState, robot);
      gripperAnimations.update(status, sceneState, robot);
      robotMatrix.push(m);
      // 正在播放装卸动画/携带Foup的机器人需要渲染 foup
      if (foupAnimations.animations[robot.id] || robot.foupId !== -1)
        foupMatrix.push(foupAnimations.getPost(robot, m));
      gripperMatrix.push(gripperAnimations.getPost(robot, m));
      const m1 = new THREE.Matrix4();
      const s = ((pulseScale.current * 100 + index) % 100) / 100 + 1;
      m1.compose(pos, quat, new THREE.Vector3(s, s, s));
      pulseMatrix.push(m1);
    });
    robotInstancedMesh.update(scene, robotMatrix);
    foupInstancedMesh.update(scene, foupMatrix);
    gripperInstancedMesh.update(scene, gripperMatrix);
    pulseInstancedMesh.update(scene, pulseMatrix);

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
    modelClone.applyMatrix4(m);
    scene.add(modelClone);
  });
};