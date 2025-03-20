// package: 
// file: status.proto

import * as jspb from "google-protobuf";

export class Ids extends jspb.Message {
  clearIdsList(): void;
  getIdsList(): Array<number>;
  setIdsList(value: Array<number>): void;
  addIds(value: number, index?: number): number;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Ids.AsObject;
  static toObject(includeInstance: boolean, msg: Ids): Ids.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Ids, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Ids;
  static deserializeBinaryFromReader(message: Ids, reader: jspb.BinaryReader): Ids;
}

export namespace Ids {
  export type AsObject = {
    idsList: Array<number>,
  }
}

export class GraphPos extends jspb.Message {
  getEdgeId(): number;
  setEdgeId(value: number): void;

  getPercent(): number;
  setPercent(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GraphPos.AsObject;
  static toObject(includeInstance: boolean, msg: GraphPos): GraphPos.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: GraphPos, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GraphPos;
  static deserializeBinaryFromReader(message: GraphPos, reader: jspb.BinaryReader): GraphPos;
}

export namespace GraphPos {
  export type AsObject = {
    edgeId: number,
    percent: number,
  }
}

export class RobotStatus extends jspb.Message {
  getId(): number;
  setId(value: number): void;

  hasPos(): boolean;
  clearPos(): void;
  getPos(): GraphPos | undefined;
  setPos(value?: GraphPos): void;

  getSpeed(): number;
  setSpeed(value: number): void;

  hasPredictPos(): boolean;
  clearPredictPos(): void;
  getPredictPos(): GraphPos | undefined;
  setPredictPos(value?: GraphPos): void;

  hasPathEdges(): boolean;
  clearPathEdges(): void;
  getPathEdges(): Ids | undefined;
  setPathEdges(value?: Ids): void;

  hasState(): boolean;
  clearState(): void;
  getState(): RobotWorkStateMap[keyof RobotWorkStateMap];
  setState(value: RobotWorkStateMap[keyof RobotWorkStateMap]): void;

  hasFoupId(): boolean;
  clearFoupId(): void;
  getFoupId(): number;
  setFoupId(value: number): void;

  hasTaskId(): boolean;
  clearTaskId(): void;
  getTaskId(): number;
  setTaskId(value: number): void;

  hasLoadingRtime(): boolean;
  clearLoadingRtime(): void;
  getLoadingRtime(): number;
  setLoadingRtime(value: number): void;

  hasLoadingTtime(): boolean;
  clearLoadingTtime(): void;
  getLoadingTtime(): number;
  setLoadingTtime(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RobotStatus.AsObject;
  static toObject(includeInstance: boolean, msg: RobotStatus): RobotStatus.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: RobotStatus, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RobotStatus;
  static deserializeBinaryFromReader(message: RobotStatus, reader: jspb.BinaryReader): RobotStatus;
}

export namespace RobotStatus {
  export type AsObject = {
    id: number,
    pos?: GraphPos.AsObject,
    speed: number,
    predictPos?: GraphPos.AsObject,
    pathEdges?: Ids.AsObject,
    state: RobotWorkStateMap[keyof RobotWorkStateMap],
    foupId: number,
    taskId: number,
    loadingRtime: number,
    loadingTtime: number,
  }
}

export class DeviceStatus extends jspb.Message {
  getId(): number;
  setId(value: number): void;

  hasFoupCache(): boolean;
  clearFoupCache(): void;
  getFoupCache(): Ids | undefined;
  setFoupCache(value?: Ids): void;

  hasFoupId(): boolean;
  clearFoupId(): void;
  getFoupId(): number;
  setFoupId(value: number): void;

  hasCycleRtime(): boolean;
  clearCycleRtime(): void;
  getCycleRtime(): number;
  setCycleRtime(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): DeviceStatus.AsObject;
  static toObject(includeInstance: boolean, msg: DeviceStatus): DeviceStatus.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: DeviceStatus, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): DeviceStatus;
  static deserializeBinaryFromReader(message: DeviceStatus, reader: jspb.BinaryReader): DeviceStatus;
}

export namespace DeviceStatus {
  export type AsObject = {
    id: number,
    foupCache?: Ids.AsObject,
    foupId: number,
    cycleRtime: number,
  }
}

export class FoupStatus extends jspb.Message {
  getId(): number;
  setId(value: number): void;

  hasCount(): boolean;
  clearCount(): void;
  getCount(): number;
  setCount(value: number): void;

  hasProcessed(): boolean;
  clearProcessed(): void;
  getProcessed(): number;
  setProcessed(value: number): void;

  hasLineId(): boolean;
  clearLineId(): void;
  getLineId(): number;
  setLineId(value: number): void;

  hasStage(): boolean;
  clearStage(): void;
  getStage(): number;
  setStage(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): FoupStatus.AsObject;
  static toObject(includeInstance: boolean, msg: FoupStatus): FoupStatus.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: FoupStatus, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): FoupStatus;
  static deserializeBinaryFromReader(message: FoupStatus, reader: jspb.BinaryReader): FoupStatus;
}

export namespace FoupStatus {
  export type AsObject = {
    id: number,
    count: number,
    processed: number,
    lineId: number,
    stage: number,
  }
}

export class TaskStatus extends jspb.Message {
  getId(): number;
  setId(value: number): void;

  hasState(): boolean;
  clearState(): void;
  getState(): TaskStateMap[keyof TaskStateMap];
  setState(value: TaskStateMap[keyof TaskStateMap]): void;

  hasPickupDevice(): boolean;
  clearPickupDevice(): void;
  getPickupDevice(): number;
  setPickupDevice(value: number): void;

  hasPlaceDevice(): boolean;
  clearPlaceDevice(): void;
  getPlaceDevice(): number;
  setPlaceDevice(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TaskStatus.AsObject;
  static toObject(includeInstance: boolean, msg: TaskStatus): TaskStatus.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: TaskStatus, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TaskStatus;
  static deserializeBinaryFromReader(message: TaskStatus, reader: jspb.BinaryReader): TaskStatus;
}

export namespace TaskStatus {
  export type AsObject = {
    id: number,
    state: TaskStateMap[keyof TaskStateMap],
    pickupDevice: number,
    placeDevice: number,
  }
}

export class FactoryStatus extends jspb.Message {
  getTime(): number;
  setTime(value: number): void;

  clearRobotsList(): void;
  getRobotsList(): Array<RobotStatus>;
  setRobotsList(value: Array<RobotStatus>): void;
  addRobots(value?: RobotStatus, index?: number): RobotStatus;

  clearDevicesList(): void;
  getDevicesList(): Array<DeviceStatus>;
  setDevicesList(value: Array<DeviceStatus>): void;
  addDevices(value?: DeviceStatus, index?: number): DeviceStatus;

  clearFoupsList(): void;
  getFoupsList(): Array<FoupStatus>;
  setFoupsList(value: Array<FoupStatus>): void;
  addFoups(value?: FoupStatus, index?: number): FoupStatus;

  clearTasksList(): void;
  getTasksList(): Array<TaskStatus>;
  setTasksList(value: Array<TaskStatus>): void;
  addTasks(value?: TaskStatus, index?: number): TaskStatus;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): FactoryStatus.AsObject;
  static toObject(includeInstance: boolean, msg: FactoryStatus): FactoryStatus.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: FactoryStatus, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): FactoryStatus;
  static deserializeBinaryFromReader(message: FactoryStatus, reader: jspb.BinaryReader): FactoryStatus;
}

export namespace FactoryStatus {
  export type AsObject = {
    time: number,
    robotsList: Array<RobotStatus.AsObject>,
    devicesList: Array<DeviceStatus.AsObject>,
    foupsList: Array<FoupStatus.AsObject>,
    tasksList: Array<TaskStatus.AsObject>,
  }
}

export interface RobotWorkStateMap {
  IDLE: 0;
  TASKASSIGNED: 1;
  WAITPICK: 2;
  FOUPPICKED: 3;
  WAITPLACE: 4;
}

export const RobotWorkState: RobotWorkStateMap;

export interface TaskStateMap {
  NOTASSIGNED: 0;
  ASSIGNED: 1;
  ACCEPTED: 2;
  FINISHED: 3;
}

export const TaskState: TaskStateMap;

