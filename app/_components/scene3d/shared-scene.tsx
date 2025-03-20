import { useCallback, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useOBJLoader } from '@hooks/model-loader';
import { useGlobalState } from '@hooks/global-state';
import { useTrack } from '@hooks/factory-core';
import { FactoryStatus, RobotStatus, RobotWorkState } from '@/lib/generated_files/status_pb';

const robotOffsetZ = -0.04;
const loadingPrepareTime = 1;
const loadingOffsetZ = 2;
const loadingOffsetXY = 1;
const sharedScene = new THREE.Scene();

export const SharedScene = ({ needsUpdate = false }: { needsUpdate?: boolean }) => {
  useSharedSceneUpdater(sharedScene, needsUpdate);
  return (
    <>
      <primitive object={sharedScene}></primitive>
    </>
  );
};

type xyz = [x: number, y: number, z: number];
type AnimationPath = {
  t: number;
  offset: xyz;
}[];

const useSharedSceneUpdater = (scene: THREE.Scene, needsUpdate = false) => {
  const time = useRef<number>(0);
  const { state: { scene: sceneStatus, paused, statusGetter } } = useGlobalState();
  const { getWorldPost } = useTrack(sceneStatus);
  const resources = useMemo(() => {
    const OHT = useOBJLoader('/models/oht-body.obj', '/models/oht-body.mtl');
    const Foup = useOBJLoader('/models/oht-foup.obj', '/models/oht-foup.mtl');
    const Gripper = useOBJLoader('/models/oht-gripper.obj', '/models/oht-gripper.mtl');
    const gOHT = (OHT?.children[0] as THREE.Mesh)?.geometry;
    const mOHT = (OHT?.children[0] as THREE.Mesh)?.material;
    const gFoup = (Foup?.children[0] as THREE.Mesh)?.geometry;
    const mFoup = (Foup?.children[0] as THREE.Mesh)?.material;
    const gGripper = (Gripper?.children[0] as THREE.Mesh)?.geometry;
    const mGripper = (Gripper?.children[0] as THREE.Mesh)?.material;
    return { gOHT, mOHT, gFoup, mFoup, gGripper, mGripper };
  }, []);

  const updateInstancedMesh = useCallback(
    (name: 'OHT' | 'Foup' | 'Gripper', matrix: THREE.Matrix4[]) => {
      if (!scene) return;
      const imName = `_im${name}`;
      // TODO: 建立一个 object 管理 InstancedMesh 以及 count，避免使用 getObjectByName
      let im = scene.getObjectByName(imName) as THREE.InstancedMesh;
      if (!im || im.count < matrix.length) {
        const geometry = resources[`g${name}`];
        const material = resources[`m${name}`];
        scene.remove(im);
        im = new THREE.InstancedMesh(geometry, material, matrix.length);
        im.name = imName;
        scene.add(im);
      } else {
        im.count = matrix.length;
      }
      matrix.forEach((m, i) => im.setMatrixAt(i, m));
      im.instanceMatrix.needsUpdate = true;
    }, [scene, resources]);

  const foupAnimations = useRef<{ [key: number]: AnimationPath }>({});
  const gripperAnimations = useRef<{ [key: number]: AnimationPath }>({});
  const updateFoupAnimationPath = useCallback(
    (status: FactoryStatus.AsObject, robot: RobotStatus.AsObject) => {
      if (robot.state === RobotWorkState.WAITPICK || robot.state === RobotWorkState.WAITPLACE) {
        if (foupAnimations.current[robot.id] === undefined) {
          const task = status.tasksList.find(t => t.id === robot.taskId);
          const dId = robot.state === RobotWorkState.WAITPICK ?
            task?.pickupDevice : task?.placeDevice;
          const device = sceneStatus!.devicesList.find(d => d.id === dId);
          if (device) {
            const r = device.rotation / 180 * Math.PI;
            const offset: xyz = [
              Math.cos(r) * loadingOffsetXY, Math.sin(r) * loadingOffsetXY, -loadingOffsetZ];
            foupAnimations.current[robot.id] = [
              { t: loadingPrepareTime, offset: [0, 0, 0] }, // 1. 准备
              { t: robot.loadingTtime / 2, offset: [0, 0, -loadingOffsetZ] }, // 2. 下降
              { t: robot.loadingTtime, offset },            // 3. 平移进出机器
            ];
          }
        }
      } else if (foupAnimations.current[robot.id] !== undefined) {
        delete foupAnimations.current[robot.id];
      }
    }, []);
  const updateGripperAnimationPath = useCallback((robot: RobotStatus.AsObject) => {
    if (robot.state === RobotWorkState.WAITPICK || robot.state === RobotWorkState.WAITPLACE) {
      if (gripperAnimations.current[robot.id] === undefined) {
        gripperAnimations.current[robot.id] = [
          { t: loadingPrepareTime, offset: [0, 0, 0] },  // 1. 准备
          { t: robot.loadingTtime / 2, offset: [0, 0, -loadingOffsetZ] }, // 2. 下降
          { t: robot.loadingTtime - loadingPrepareTime, offset: [0, 0, 0] }, // 3. 上升
        ];
      }
    } else if (gripperAnimations.current[robot.id] !== undefined) {
      delete gripperAnimations.current[robot.id];
    }
  }, []);

  const getOffset: (t: number, a: AnimationPath) => xyz = useCallback((t, a) => {
    if (a.length > 0) {
      if (t <= a[0].t) return a[0].offset;
      if (t >= a.at(-1)!.t) return a.at(-1)!.offset;
      for (let i = 0; i < a.length - 1; i++) {
        const p1 = a[i];
        const p2 = a[i + 1];
        if (t >= p1.t && t <= p2.t) {
          const percent = (t - p1.t) / (p2.t - p1.t);
          const x = p1.offset[0] + (p2.offset[0] - p1.offset[0]) * percent;
          const y = p1.offset[1] + (p2.offset[1] - p1.offset[1]) * percent;
          const z = p1.offset[2] + (p2.offset[2] - p1.offset[2]) * percent;
          return [x, y, z];
        }
      }
    }
    return [0, 0, 0];
  }, []);

  useFrame((state, dt) => {
    if (!needsUpdate || !scene || !statusGetter || !sceneStatus)
      return;
    const status = statusGetter(paused ? time.current : time.current + dt);
    if (!status)
      return;
    time.current = status.time;
    const robotMatrix: THREE.Matrix4[] = [];
    const foupMatrix: THREE.Matrix4[] = [];
    const gripperMatrix: THREE.Matrix4[] = [];
    status.robotsList.forEach(robot => {
      const [x, y, z, r] = getWorldPost(robot.pos!);
      const m = new THREE.Matrix4();
      const pos = new THREE.Vector3(x, y, z + robotOffsetZ);
      const quat = new THREE.Quaternion();
      quat.setFromAxisAngle(new THREE.Vector3(0, 0, 1), r);
      m.compose(pos, quat, new THREE.Vector3(1, 1, 1));
      robotMatrix.push(m);

      const animationT = robot.state === RobotWorkState.WAITPICK ?
        robot.loadingTtime - robot.loadingRtime : robot.loadingRtime;
      // 渲染 foup
      updateFoupAnimationPath(status, robot);
      if (foupAnimations.current[robot.id] !== undefined) {
        const offset = getOffset(animationT, foupAnimations.current[robot.id]);
        const m1 = m.clone();
        m1.makeTranslation(...offset);
        foupMatrix.push(m1);
      } else if (robot.foupId !== -1) {
        foupMatrix.push(m);
      }
      // 渲染爪夹
      updateGripperAnimationPath(robot);
      if (gripperAnimations.current[robot.id] !== undefined) {
        const offset = getOffset(animationT, gripperAnimations.current[robot.id]);
        const m1 = m.clone();
        m1.makeTranslation(...offset);
        gripperMatrix.push(m1);
      } else {
        gripperMatrix.push(m);
      }
    });
    updateInstancedMesh('OHT', robotMatrix);
    updateInstancedMesh('Foup', foupMatrix);
    updateInstancedMesh('Gripper', gripperMatrix);
  });
};