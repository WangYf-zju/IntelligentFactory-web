import { FactoryStatus, RobotStatus, DeviceStatus, GraphPos } from '@/lib/generated_files/status_pb';
import { FactoryScene } from '@/lib/generated_files/scene_pb';

function LinearInterpolate(start: number, end: number, percent: number) {
  return start + (end - start) * percent;
}

function GraphPosInterpolate(scene: FactoryScene.AsObject, 
  pos1: GraphPos.AsObject, pos2: GraphPos.AsObject, percent: number) {
  // TODO: 考虑 pos1 和 pos2 的 edge 不相连的情况，需要根据 robot_path 插值
  if (pos1.edgeId == pos2.edgeId)
    return { edgeId: pos1.edgeId, percent: LinearInterpolate(pos1.percent, pos2.percent, percent) };
  const track1 = scene.tracksList.find(t => t.id == pos1.edgeId)
  const track2 = scene.tracksList.find(t => t.id == pos2.edgeId)
  if (track1 === undefined || track2 === undefined)
    return { ...pos1 };
  const length1 = track1.length * (1 - pos1.percent);
  const length2 = track2.length * pos2.percent;
  const length = (length1 + length2) * percent;
  if (length < length1)
    return { edgeId: pos1.edgeId, percent: pos1.percent + length / track1.length };
  else
    return { edgeId: pos2.edgeId, percent: (length - length1) / track2.length };
}

function RobotStatusInterpolate(scene: FactoryScene.AsObject, 
  robot1: RobotStatus.AsObject, robot2: RobotStatus.AsObject, percent: number) {
  return {
    ...robot1,
    // TODO: 增加加速度曲线字段，根据加速度曲线计算精确位置和速度
    pos: GraphPosInterpolate(scene, robot1.pos!, robot2.pos!, percent),
    speed: LinearInterpolate(robot1.speed, robot2.speed, percent),
    loadingRtime: LinearInterpolate(robot1.loadingRtime, robot2.loadingRtime, percent),
    distanceToEnd: LinearInterpolate(robot1.distanceToEnd, robot2.distanceToEnd, percent),
    timeToEnd: LinearInterpolate(robot1.timeToEnd, robot2.timeToEnd, percent),
  };
}

function DeviceStatusInterpolate(device1: DeviceStatus.AsObject, device2: DeviceStatus.AsObject, percent: number) {
  return {
    ...device1,
    cycleRtime: LinearInterpolate(device1.cycleRtime, device2.cycleRtime, percent),
  };
}

function StatusInterpolate(scene: FactoryScene.AsObject,
  frame1: FactoryStatus.AsObject, frame2: FactoryStatus.AsObject, time: number): FactoryStatus.AsObject {
  const percent = (time - frame1.time) / (frame2.time - frame1.time);
  return {
    ...frame1,
    time,
    robotsList: frame1.robotsList.map((robot1, index) =>
      RobotStatusInterpolate(scene, robot1, frame2.robotsList[index], percent)),
    devicesList: frame1.devicesList.map((device1, index) =>
      DeviceStatusInterpolate(device1, frame2.devicesList[index], percent))
  };
}

export default StatusInterpolate;