import { useCallback, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { MTLLoader, OBJLoader } from 'three/examples/jsm/Addons.js';
import { useGlobalState } from '@hooks/global-state';
import { useTrack } from '@hooks/factory-core';
import { FactoryStatus, RobotStatus, RobotWorkState, TaskStatus } from '@/lib/generated_files/status_pb';
import { Device, FactoryScene } from '@/lib/generated_files/scene_pb';

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

const useInstancedMesh = (geometry: THREE.BufferGeometry,
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

const useRobotModel = (name: string) => {
  const OBJPath = `/models/${name}.obj`;
  const MTLPath = `/models/${name}.mtl`;
  const geometry = useRef<THREE.BufferGeometry>(null);
  const material = useRef<THREE.Material | THREE.Material[]>(null);
  const model = useRef<THREE.Group<THREE.Object3DEventMap>>(null);
  useEffect(() => {
    const loadMTL = () =>
      new Promise<MTLLoader.MaterialCreator>((resolve, reject) =>
        new MTLLoader().load(MTLPath, resolve, () => undefined, reject));
    const loadOBJ = (materials: MTLLoader.MaterialCreator) => {
      const loader = new OBJLoader();
      loader.setMaterials(materials);
      return new Promise<THREE.Group<THREE.Object3DEventMap>>((resolve, reject) =>
        loader.load(OBJPath, resolve, () => undefined, reject));
    }
    loadMTL().then(mtl => loadOBJ(mtl)).then(m => {
      if (m.children.length > 1) {
        console.warn(`Model ${name} has more than one mesh, only the first mesh will be rendered`);
      }
      model.current = m;
      geometry.current = (m.children[0] as THREE.Mesh)?.geometry;
      material.current = (m.children[0] as THREE.Mesh)?.material;
    }).catch(e => {
      console.log(`Cannot load model ${name}\n`, e);
    });
  }, [name]);
  return {
    model: model.current, gm:
      [geometry.current, material.current] as
      [g: THREE.BufferGeometry, m: THREE.Material | THREE.Material[]]
  };
};

const useRobot = (
  statusGetter: (t: number) => FactoryStatus.AsObject | undefined) => {
  // if (typeof window === 'undefined') { // 禁止服务端渲染
  //   return { frameUpdate: () => undefined };
  // }
  // 加载资源
  const robotModel = useRobotModel('oht-body');
  const foupModel = useRobotModel('oht-foup');
  const gripperModel = useRobotModel('oht-gripper');
  // const robotInstancedMesh = useInstancedMesh(...robotModel.gm);
  // const foupInstancedMesh = useInstancedMesh(...foupModel.gm);
  // const gripperInstancedMesh = useInstancedMesh(...gripperModel.gm);
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
  const { state: { scene: sceneState, paused } } = useGlobalState();
  const { getWorldPost } = useTrack(sceneState);

  const frameUpdate = (scene: THREE.Scene, dt: number) => {
    if (!scene || !statusGetter || !sceneState) return;
    const status = statusGetter(paused ? time.current : time.current + dt);
    if (!status) return;
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
      // 判断并更新装卸动画
      foupAnimations.update(status, sceneState, robot);
      gripperAnimations.update(status, sceneState, robot);

      robotMatrix.push(m);
      // 正在播放装卸动画/携带Foup的机器人需要渲染 foup
      if (foupAnimations.animations[robot.id] || robot.foupId !== -1)
        foupMatrix.push(foupAnimations.getPost(robot, m));
      gripperMatrix.push(gripperAnimations.getPost(robot, m));
    });
    // robotInstancedMesh.update(scene, robotMatrix);
    // foupInstancedMesh.update(scene, foupMatrix);
    // gripperInstancedMesh.update(scene, gripperMatrix);
    scene.clear();
    renderOBJModels(scene, robotMatrix, robotModel.model);
    renderOBJModels(scene, foupMatrix, foupModel.model);
    renderOBJModels(scene, gripperMatrix, gripperModel.model);
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
}

export default useRobot;