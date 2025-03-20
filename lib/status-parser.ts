import {
  DeviceStatus,
  FactoryStatus,
  FoupStatus,
  RobotStatus,
  TaskStatus
} from '@/lib/generated_files/status_pb';

const FactoryStatusParser = (status: FactoryStatus) => {
  const time = status.getTime();
  const robotsList: Partial<RobotStatus.AsObject>[] = status.getRobotsList().map(r => {
    const res: Partial<RobotStatus.AsObject> = { id: r.getId(), speed: r.getSpeed() };
    if (r.hasPos()) res['pos'] = r.getPos()!.toObject();
    if (r.hasPredictPos()) res['predictPos'] = r.getPredictPos()!.toObject();
    if (r.hasPathEdges()) res['pathEdges'] = r.getPathEdges()!.toObject();
    if (r.hasState()) res['state'] = r.getState();
    if (r.hasFoupId()) res['foupId'] = r.getFoupId();
    if (r.hasTaskId()) res['taskId'] = r.getTaskId();
    if (r.hasLoadingRtime()) res['loadingRtime'] = r.getLoadingRtime();
    if (r.hasLoadingTtime()) res['loadingTtime'] = r.getLoadingTtime();
    return res;
  });
  const devicesList: Partial<DeviceStatus.AsObject>[] = status.getDevicesList().map(d => {
    const res: Partial<DeviceStatus.AsObject> = { id: d.getId() };
    if (d.hasFoupCache()) res['foupCache'] = d.getFoupCache()!.toObject();
    if (d.hasFoupId()) res['foupId'] = d.getFoupId();
    if (d.hasCycleRtime()) res['cycleRtime'] = d.getCycleRtime();
    return res;
  });
  const foupsList: Partial<FoupStatus.AsObject>[] = status.getFoupsList().map(f => {
    const res: Partial<FoupStatus.AsObject> = { id: f.getId() };
    if (f.hasCount()) res['count'] = f.getCount();
    if (f.hasProcessed()) res['processed'] = f.getProcessed();
    if (f.hasLineId()) res['lineId'] = f.getLineId();
    if (f.hasStage()) res['stage'] = f.getStage();
    return res;
  });
  const tasksList: Partial<TaskStatus.AsObject>[] = status.getTasksList().map(t => {
    const res: Partial<TaskStatus.AsObject> = { id: t.getId() };
    if (t.hasState()) res['state'] = t.getState();
    if (t.hasPickupDevice()) res['pickupDevice'] = t.getPickupDevice();
    if (t.hasPlaceDevice()) res['placeDevice'] = t.getPlaceDevice();
    return res;
  });

  return {
    time,
    robotsList,
    devicesList,
    foupsList,
    tasksList,
  }
};

export default FactoryStatusParser;