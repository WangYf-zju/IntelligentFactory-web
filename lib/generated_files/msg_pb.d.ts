// package: 
// file: msg.proto

import * as jspb from "google-protobuf";

export class FactoryMsg extends jspb.Message {
  getType(): FactoryMsgTypeMap[keyof FactoryMsgTypeMap];
  setType(value: FactoryMsgTypeMap[keyof FactoryMsgTypeMap]): void;

  hasPayload(): boolean;
  clearPayload(): void;
  getPayload(): Uint8Array | string;
  getPayload_asU8(): Uint8Array;
  getPayload_asB64(): string;
  setPayload(value: Uint8Array | string): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): FactoryMsg.AsObject;
  static toObject(includeInstance: boolean, msg: FactoryMsg): FactoryMsg.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: FactoryMsg, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): FactoryMsg;
  static deserializeBinaryFromReader(message: FactoryMsg, reader: jspb.BinaryReader): FactoryMsg;
}

export namespace FactoryMsg {
  export type AsObject = {
    type: FactoryMsgTypeMap[keyof FactoryMsgTypeMap],
    payload: Uint8Array | string,
  }
}

export interface FactoryMsgTypeMap {
  SCENE: 0;
  STATUS: 1;
  PAUSE: 2;
  RESET: 3;
  FREQ: 4;
  RATE: 5;
  CUSTOM: 6;
}

export const FactoryMsgType: FactoryMsgTypeMap;

