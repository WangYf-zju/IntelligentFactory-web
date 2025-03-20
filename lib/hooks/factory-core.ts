import { useEffect, useRef, useCallback, useMemo } from 'react';
import { FactoryMsg, FactoryMsgType } from '@/lib/generated_files/msg_pb';
import { FactoryStatus, GraphPos } from '@/lib/generated_files/status_pb';
import { FactoryScene, Position } from '@/lib/generated_files/scene_pb';
import StatusInterpolate from '@/lib/status-interpolate';
import { useGlobalState } from "@hooks/global-state";
import FactoryStatusParser from '../status-parser';

const useFactoryStatusQueue = (scene: FactoryScene.AsObject | undefined) => {
  // const [factoryStatusQueue, setFactoryStatusQueue] = useState<FactoryStatus.AsObject[]>([]);
  const factoryStatusQueue = useRef<FactoryStatus.AsObject[]>([]);

  const updateStatusQueue = useCallback((status: ReturnType<typeof FactoryStatusParser>) => {
    const mergeArrays: <T extends { id: number }>(prevArray: T[] | undefined, newArray: Partial<T>[]) => T[]
      = (prevArray, newArray) => {
        const merged = prevArray ? [...prevArray] : [];
        newArray.forEach(newItem => {
          const index = merged.findIndex(item => item['id'] === newItem['id']);
          if (index !== -1) {
            merged[index] = { ...merged[index], ...newItem };
          } else {
            merged.push(newItem as any); // 第一次返回数据包括全部字段
          }
        });
        return merged;
      };

    const prevStatus = factoryStatusQueue.current.at(-1);
    const newStatus = {
      ...prevStatus,
      ...status,
      robotsList: mergeArrays(prevStatus?.robotsList, status.robotsList),
      devicesList: mergeArrays(prevStatus?.devicesList, status.devicesList),
      foupsList: mergeArrays(prevStatus?.foupsList, status.foupsList),
      tasksList: mergeArrays(prevStatus?.tasksList, status.tasksList),
    }
    // TODO: 考虑是否需要存储过期的状态
    // TODO: 过滤异常数据（不存在的id）

    if (factoryStatusQueue.current.length === 0 ||
      factoryStatusQueue.current.at(-1)!.time < newStatus.time)
      factoryStatusQueue.current.push(newStatus);
  }, [factoryStatusQueue.current]);

  const clearStatusQueue = useCallback(() => {
    factoryStatusQueue.current.splice(0, factoryStatusQueue.current.length);
  }, [factoryStatusQueue.current]);

  const statusGetter = useCallback((time: number) => {
    if (!scene || !factoryStatusQueue)
      return undefined;
    if (factoryStatusQueue.current.length === 1)
      return factoryStatusQueue.current[0];
    const index = factoryStatusQueue.current.findIndex(s => s.time >= time)
    if (index === -1) // time 比最后一个接收到的数据帧的 time 还要大
      return factoryStatusQueue.current.at(-1);
    if (factoryStatusQueue.current[index!].time == time)
      return factoryStatusQueue.current[index]
    factoryStatusQueue.current.splice(0, index - 1) // 删除旧的帧
    const frame1 = factoryStatusQueue.current[0];
    const frame2 = factoryStatusQueue.current[1];
    return StatusInterpolate(scene, frame1, frame2, time)
  }, [factoryStatusQueue.current, scene]);

  return { updateStatusQueue, clearStatusQueue, statusGetter };
};

export const useFactory = () => {
  const ws = useRef<WebSocket>(null);
  const { state: { scene }, dispatch } = useGlobalState();
  const { updateStatusQueue, clearStatusQueue, statusGetter } = useFactoryStatusQueue(scene);

  useEffect(() => {
    dispatch({ type: 'setStatusGetter', payload: statusGetter });
  }, [statusGetter]);

  const messageHandler = useCallback((msg: FactoryMsg) => {
    const type = msg.getType();
    const payload = msg.getPayload_asU8();
    if (type === FactoryMsgType.SCENE) {
      const scene = FactoryScene.deserializeBinary(payload);
      dispatch({ type: 'setScene', payload: scene.toObject() });
    } else if (type === FactoryMsgType.STATUS) {
      const status = FactoryStatus.deserializeBinary(payload);
      const statusObject = FactoryStatusParser(status)
      updateStatusQueue(statusObject);
    } else if (type === FactoryMsgType.PAUSE) {
      if (payload.length === 0) // 服务端返回的 PAUSE 消息必须有 payload
        return
      const pause = Boolean(payload[0]);
      dispatch({ type: 'setPaused', payload: pause });
    }
  }, [updateStatusQueue]);

  useEffect(() => {
    return () => { ws.current?.close(); };
  }, []);

  const connectServer = useCallback((url: string) => {
    if (!url) return;
    if (ws.current?.readyState === WebSocket.OPEN) return;
    ws.current = new WebSocket(url);
    ws.current.onopen = () => {
      console.log('WS open');
      clearStatusQueue();
      dispatch({ type: 'setConnected', payload: true });
    };
    ws.current.onmessage = async (event) => {
      try {
        const arrayBuffer = await (event.data as Blob).arrayBuffer();
        const msg = FactoryMsg.deserializeBinary(new Uint8Array(arrayBuffer));
        messageHandler(msg);
      } catch (e) {
        console.log('Invalid msg received', e);
      }
    };
    ws.current.onclose = () => {
      dispatch({ type: 'setConnected', payload: false });
      console.log("WS close");
    };
    ws.current.onerror = () => {
      console.log("WS error close");
    }
  }, [clearStatusQueue]);

  const sendPause = useCallback((pause: boolean) => {
    if (ws.current) {
      const msg = new FactoryMsg();
      msg.setType(FactoryMsgType.PAUSE);
      msg.setPayload(new Uint8Array([Number(pause)]));
      ws.current.send(msg.serializeBinary());
      dispatch({ type: 'setPaused', payload: pause });
    }
  }, [ws]);

  return { sendPause, statusGetter, connectServer };
};

type xyz = [x: number, y: number, z: number];

export const useTrack = (scene: FactoryScene.AsObject | undefined) => {
  const { tracks = {}, lineTracks = [], arcTracks = [] } = useMemo(() => {
    if (!scene) return {};
    const transPos = (p: Position.AsObject): xyz => [p.x, p.y, p.z];
    const nodes: { [key: number]: xyz } = {};
    scene.nodesList.forEach(n => nodes[n.id] = transPos(n.position!));
    const tracks: { [key: number]: { type: 'line' | 'arc', index: number } } = {};

    const lineTracks = scene.tracksList.filter(t => t.type.toLowerCase() === 'line')
      .filter(t => nodes[t.start] && nodes[t.end])
      .map(t => ({ id: t.id, start: nodes[t.start], end: nodes[t.end] }));
    const arcTracks = scene.tracksList.filter(t => t.type.toLowerCase() === 'arc')
      .filter(t => nodes[t.start] && nodes[t.end] && t.center)
      .map(t => ({ ...t, start: nodes[t.start], end: nodes[t.end], center: transPos(t.center!) }));
    lineTracks.forEach((t, i) => tracks[t.id] = { type: 'line', index: i });
    arcTracks.forEach((t, i) => tracks[t.id] = { type: 'arc', index: i });
    return { nodes, tracks, lineTracks, arcTracks };
  }, [scene]);
  const getWorldPost: (pos: GraphPos.AsObject) => [...xyz, r: number] = useCallback((pos) => {
    const { type, index } = tracks[pos.edgeId];
    if (type === 'arc') {
      const track = arcTracks[index];
      const [x1, y1, z1] = track.start;
      const [x2, y2, z2] = track.end;
      const [xc, yc, zc] = track.center;
      const thetaS = Math.atan2(y1 - yc, x1 - xc);
      const thetaE = Math.atan2(y2 - yc, x2 - xc);
      // TODO: 考虑优弧 ???
      // TODO: 优化计算方法（注意 angle0/angle1 目前没有与 start/end 对应上）
      let theta = 0;
      if (thetaS > thetaE && thetaS - thetaE > Math.PI) {
        theta = thetaS + (thetaE + 2 * Math.PI - thetaS) * pos.percent;
      } else if (thetaS > thetaE && thetaS - thetaE <= Math.PI) {
        theta = thetaS - (thetaS - thetaE) * pos.percent;
      } else if (thetaE > thetaS && thetaE - thetaS > Math.PI) {
        theta = thetaS - (thetaS + 2 * Math.PI - thetaE) * pos.percent;
      } else {
        theta = thetaS + (thetaE - thetaS) * pos.percent;
      }
      const x = xc + Math.cos(theta) * track.radius;
      const y = yc + Math.sin(theta) * track.radius;
      const z = z1 + (z2 - z1) * pos.percent;
      theta += Math.PI / 2;
      return [x, y, z, theta];
    } else if (type === 'line') {
      const track = lineTracks[index];
      const [x1, y1, z1] = track.start;
      const [x2, y2, z2] = track.end;
      const x = x1 + (x2 - x1) * pos.percent;
      const y = y1 + (y2 - y1) * pos.percent;
      const z = z1 + (z2 - z1) * pos.percent;
      const r = Math.atan2(y2 - y1, x2 - x1);
      return [x, y, z, r];
    }
    return [Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE, 0];
  }, [tracks, lineTracks, arcTracks]); // 返回的 r 是弧度
  return { lineTracks, arcTracks, getWorldPost };
}

// import { useEffect, useState } from "react";
// import { useGlobalState } from "@hooks/global-state";
// import { useFactoryScene, useFactoryStatusQueue } from "@hooks/factory-msg";
// import { FactoryStatus } from "@/lib/generated_files/status_pb";

// export default function useFactoryCore() {
//   // TODO: loading 状态
//   const fps = 1 / 30;
//   const [time, setTime] = useState(0);
//   const [status, setStatus] = useState<FactoryStatus.AsObject>();
//   const { state: { sceneUrl = '', statusUrl = '' }, dispatch } = useGlobalState();
//   const { scene } = useFactoryScene(sceneUrl);
//   const { getStatusAtTime } = useFactoryStatusQueue(statusUrl, scene);
//   const frameUpdate = (dt: number) => {
//     const s = getStatusAtTime(time);
//     if (s && s.time === time)
//       setTime(time + fps);
//     setStatus(s);
//   };
//   useEffect(() => {
//     scene && dispatch({ type: 'setScene', payload: scene });
//   }, [scene]);
//   useEffect(() => {
//     status && dispatch({ type: 'setStatus', payload: status });
//   }, [status]);
//   return { scene, status, frameUpdate };
// }