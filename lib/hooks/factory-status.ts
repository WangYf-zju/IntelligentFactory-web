import { useState, useEffect, useRef, useCallback } from 'react';
import { FactoryStatus } from '@/lib/generated_files/status_pb';
import { FactoryScene } from '@/lib/generated_files/scene_pb';
import StatusInterpolate from '@/lib/status-interpolate';

const useFactoryStatus = (url: string, scene: FactoryScene.AsObject) => {
  const [factoryStatusQueue, setFactoryStatusQueue] = useState<FactoryStatus.AsObject[]>([]);
  const ws = useRef<WebSocket>(null);

  useEffect(() => {
    ws.current = new WebSocket(url);

    ws.current.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.current.onmessage = (event) => {
      const arrayBuffer = event.data;
      const factoryStatusProto = FactoryStatus.deserializeBinary(new Uint8Array(arrayBuffer));
      const newStatus = factoryStatusProto.toObject();
      const prevStatus = factoryStatusQueue.at(-1)
      const status = {
        ...prevStatus,
        ...newStatus,
        robots: mergeArrays(prevStatus?.robotsList, newStatus.robotsList, 'id'),
        devices: mergeArrays(prevStatus?.devicesList, newStatus.devicesList, 'id'),
        foups: mergeArrays(prevStatus?.foupsList, newStatus.foupsList, 'id'),
        tasks: mergeArrays(prevStatus?.tasksList, newStatus.tasksList, 'id'),
      }

      setFactoryStatusQueue(prevQueue => {
        const updatedQueue = [...prevQueue, status].sort((a, b) => a.time - b.time);
        return updatedQueue;
      });
    };

    ws.current.onclose = () => {
      console.log('WebSocket disconnected');
    };

    return () => {
      ws.current?.close();
    };
  }, [url]);

  const mergeArrays = (prevArray: any[] | undefined, newArray: any[], key: string) => {
    const merged = prevArray ? [...prevArray] : [];
    newArray.forEach(newItem => {
      const index = merged.findIndex(item => item[key] === newItem[key]);
      if (index !== -1) {
        merged[index] = { ...merged[index], ...newItem };
      } else {
        merged.push(newItem);
      }
    });
    return merged;
  };

  const getStatusAtTime = useCallback((time: number) => {
    const index = factoryStatusQueue.findIndex(s => s.time >= time)
    if (index === -1 || index === factoryStatusQueue.length)
      return undefined
    if (factoryStatusQueue[index!].time == time)
      return factoryStatusQueue[index]
    factoryStatusQueue.splice(0, index - 1) // 删除旧的帧
    const frame1 = factoryStatusQueue[0];
    const frame2 = factoryStatusQueue[1];
    return StatusInterpolate(scene, frame1, frame2, time)
  }, [factoryStatusQueue, scene]);

  return { factoryStatusQueue, getStatusAtTime };
};

export default useFactoryStatus;