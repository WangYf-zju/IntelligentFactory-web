// package: 
// file: data/scene.proto

import * as jspb from "google-protobuf";

export class Position extends jspb.Message {
  getX(): number;
  setX(value: number): void;

  getY(): number;
  setY(value: number): void;

  getZ(): number;
  setZ(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Position.AsObject;
  static toObject(includeInstance: boolean, msg: Position): Position.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Position, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Position;
  static deserializeBinaryFromReader(message: Position, reader: jspb.BinaryReader): Position;
}

export namespace Position {
  export type AsObject = {
    x: number,
    y: number,
    z: number,
  }
}

export class TrackNode extends jspb.Message {
  getId(): number;
  setId(value: number): void;

  hasPosition(): boolean;
  clearPosition(): void;
  getPosition(): Position | undefined;
  setPosition(value?: Position): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TrackNode.AsObject;
  static toObject(includeInstance: boolean, msg: TrackNode): TrackNode.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: TrackNode, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TrackNode;
  static deserializeBinaryFromReader(message: TrackNode, reader: jspb.BinaryReader): TrackNode;
}

export namespace TrackNode {
  export type AsObject = {
    id: number,
    position?: Position.AsObject,
  }
}

export class Track extends jspb.Message {
  getId(): number;
  setId(value: number): void;

  getType(): string;
  setType(value: string): void;

  getStart(): number;
  setStart(value: number): void;

  getEnd(): number;
  setEnd(value: number): void;

  getLength(): number;
  setLength(value: number): void;

  hasRadius(): boolean;
  clearRadius(): void;
  getRadius(): number;
  setRadius(value: number): void;

  hasAngle0(): boolean;
  clearAngle0(): void;
  getAngle0(): number;
  setAngle0(value: number): void;

  hasAngle1(): boolean;
  clearAngle1(): void;
  getAngle1(): number;
  setAngle1(value: number): void;

  hasCenter(): boolean;
  clearCenter(): void;
  getCenter(): Position | undefined;
  setCenter(value?: Position): void;

  hasDire(): boolean;
  clearDire(): void;
  getDire(): boolean;
  setDire(value: boolean): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Track.AsObject;
  static toObject(includeInstance: boolean, msg: Track): Track.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Track, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Track;
  static deserializeBinaryFromReader(message: Track, reader: jspb.BinaryReader): Track;
}

export namespace Track {
  export type AsObject = {
    id: number,
    type: string,
    start: number,
    end: number,
    length: number,
    radius: number,
    angle0: number,
    angle1: number,
    center?: Position.AsObject,
    dire: boolean,
  }
}

export class Device extends jspb.Message {
  getId(): number;
  setId(value: number): void;

  getName(): string;
  setName(value: string): void;

  getType(): string;
  setType(value: string): void;

  hasPosition(): boolean;
  clearPosition(): void;
  getPosition(): Position | undefined;
  setPosition(value?: Position): void;

  getRotation(): number;
  setRotation(value: number): void;

  getModel(): string;
  setModel(value: string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Device.AsObject;
  static toObject(includeInstance: boolean, msg: Device): Device.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Device, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Device;
  static deserializeBinaryFromReader(message: Device, reader: jspb.BinaryReader): Device;
}

export namespace Device {
  export type AsObject = {
    id: number,
    name: string,
    type: string,
    position?: Position.AsObject,
    rotation: number,
    model: string,
  }
}

export class TrackPosition extends jspb.Message {
  getTrack(): number;
  setTrack(value: number): void;

  getPercent(): number;
  setPercent(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TrackPosition.AsObject;
  static toObject(includeInstance: boolean, msg: TrackPosition): TrackPosition.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: TrackPosition, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TrackPosition;
  static deserializeBinaryFromReader(message: TrackPosition, reader: jspb.BinaryReader): TrackPosition;
}

export namespace TrackPosition {
  export type AsObject = {
    track: number,
    percent: number,
  }
}

export class Station extends jspb.Message {
  getId(): number;
  setId(value: number): void;

  getType(): string;
  setType(value: string): void;

  getDevice(): number;
  setDevice(value: number): void;

  hasPosition(): boolean;
  clearPosition(): void;
  getPosition(): TrackPosition | undefined;
  setPosition(value?: TrackPosition): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Station.AsObject;
  static toObject(includeInstance: boolean, msg: Station): Station.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: Station, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Station;
  static deserializeBinaryFromReader(message: Station, reader: jspb.BinaryReader): Station;
}

export namespace Station {
  export type AsObject = {
    id: number,
    type: string,
    device: number,
    position?: TrackPosition.AsObject,
  }
}

export class FactoryScene extends jspb.Message {
  getName(): string;
  setName(value: string): void;

  getVersion(): string;
  setVersion(value: string): void;

  clearNodesList(): void;
  getNodesList(): Array<TrackNode>;
  setNodesList(value: Array<TrackNode>): void;
  addNodes(value?: TrackNode, index?: number): TrackNode;

  clearTracksList(): void;
  getTracksList(): Array<Track>;
  setTracksList(value: Array<Track>): void;
  addTracks(value?: Track, index?: number): Track;

  clearDevicesList(): void;
  getDevicesList(): Array<Device>;
  setDevicesList(value: Array<Device>): void;
  addDevices(value?: Device, index?: number): Device;

  clearStationsList(): void;
  getStationsList(): Array<Station>;
  setStationsList(value: Array<Station>): void;
  addStations(value?: Station, index?: number): Station;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): FactoryScene.AsObject;
  static toObject(includeInstance: boolean, msg: FactoryScene): FactoryScene.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: FactoryScene, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): FactoryScene;
  static deserializeBinaryFromReader(message: FactoryScene, reader: jspb.BinaryReader): FactoryScene;
}

export namespace FactoryScene {
  export type AsObject = {
    name: string,
    version: string,
    nodesList: Array<TrackNode.AsObject>,
    tracksList: Array<Track.AsObject>,
    devicesList: Array<Device.AsObject>,
    stationsList: Array<Station.AsObject>,
  }
}

