import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Button, Space, Table, TableColumnsType } from 'antd';
import { CameraInfo, useGlobalState } from '@hooks/global-state';
import useResizeObserver from '@hooks/resize-observer';
import useLocalStorage from '@hooks/local-storage';

const round = (num: number | undefined, digits: number) => {
  const c = Math.pow(10, digits);
  return Math.round((num || 0) * c) / c;
}

interface DataType {
  key: React.Key;
  id: number;
  target: string;
  position: string;
  rotation: string;
  near: string;
  far: string;
  fov: string;
  aspect: string;
  zoom: string;
  focus: string;
}

interface CameraTableDataType extends DataType {
  nodeId: string;
}

const columns: TableColumnsType<any> = [
  { title: '目标', dataIndex: 'target', width: 150 },
  { title: '位置', dataIndex: 'position', width: 150 },
  { title: '旋转', dataIndex: 'rotation', width: 150 },
  { title: '近截面', dataIndex: 'near', width: 60 },
  { title: '远截面', dataIndex: 'far', width: 60 },
  { title: '视场角', dataIndex: 'fov', width: 60 },
  { title: '纵横比', dataIndex: 'aspect', width: 60 },
  { title: '缩放', dataIndex: 'zoom', width: 45 },
  { title: '焦距', dataIndex: 'focus', width: 45 },
]

const DIGITS = 2;

const CameraTable = () => {
  const { state: { nodes }, dispatch } = useGlobalState();
  const [selectMemory, setSelectMemory] = useState(-1);
  const [memory, setMemory] = useState<(typeof nodes[0]['cameraInfo'])[]>([]);
  const [localStorageMemory, setLocalStorageMemory] = useLocalStorage("camera-memory", []);
  // memory 初始化
  useEffect(() => { setMemory(localStorageMemory) }, []);
  // 存储 memory 到 local storage
  useEffect(() => { setLocalStorageMemory(memory) }, [memory]);
  const onClickStore = (nodeId: string) => {
    setMemory([...memory, {
      ...nodes[nodeId].cameraInfo
    }]);
  };
  const onClickRecover = (nodeId: string) => {
    selectMemory >= 0 && selectMemory < memory.length && dispatch({
      type: 'changeNodeCameraInfo',
      payload: { id: nodeId, info: memory[selectMemory] },
    });
  };
  const onClickRemove = (index: number) => {
    const m = [...memory];
    m.splice(index, 1);
    setMemory(m);
  }
  const onSelectionChange = (keys: React.Key[], rows: DataType[]) => {
    const k = keys.length ? keys[0] as number: -1;
    setSelectMemory(k);
  };

  const cameraColumns: TableColumnsType<CameraTableDataType> = [
    {
      title: '序号',
      dataIndex: 'id',
      width: 50,
      render: (value, record, index) => <div title={`${record.nodeId}`}>{value}</div>
    },
    {
      title: '操作',
      width: 110,
      render: (value, record, index) => (
        <Space>
          <Button size="small" onClick={() => onClickStore(record.nodeId)}>暂存</Button>
          <Button size="small" onClick={() => onClickRecover(record.nodeId)}>恢复</Button>
        </Space>
      ),
    },
    ...columns,
  ];
  const memoryColumns: TableColumnsType<DataType> = [
    {
      title: '操作',
      width: 60,
      render: (value, record, index) => (
        <Space>
          <Button size="small" onClick={() => onClickRemove(index)}>删除</Button>
        </Space>
      ),
    },
    ...columns,
  ];

  const serializeCameraInfo = (info: typeof nodes[0]['cameraInfo'], index: number) => {
    const tar = info.target;
    const pos = info.position;
    const rot = info.rotation;
    return {
      key: index,
      id: index,
      target: `(${round(tar?.at(0), DIGITS)}, ${round(tar?.at(1), DIGITS)}, ${round(tar?.at(2), DIGITS)})`,
      position: `(${round(pos?.at(0), DIGITS)}, ${round(pos?.at(1), DIGITS)}, ${round(pos?.at(2), DIGITS)})`,
      rotation: `(${round(rot?.at(0), DIGITS)}, ${round(rot?.at(1), DIGITS)}, ${round(rot?.at(2), DIGITS)})`,
      near: `${round(info.near, DIGITS)}`,
      far: `${round(info.far, DIGITS)}`,
      fov: `${round(info.fov, DIGITS)}`,
      aspect: `${round(info.aspect, DIGITS)}`,
      zoom: `${round(info.zoom, DIGITS)}`,
      focus: `${round(info.focus, DIGITS)}`,
    }
  }

  const cameraDataSource = useMemo(() => {
    return Object.values(nodes).filter(n => n.cameraInfo).map((n, index) => {
      return { ...serializeCameraInfo(n.cameraInfo, index), nodeId: n.id };
    });
  }, [nodes]);
  const memoryDataSource = useMemo(() => memory.map((info, index) =>
    serializeCameraInfo(info, index)), [memory]);

  const divRef = useRef<HTMLDivElement>(null);
  const size = useResizeObserver(divRef);


  return (
    <div className="w-full h-full" ref={divRef}>
      <Table
        locale={{ emptyText: null }}
        pagination={false}
        columns={cameraColumns}
        dataSource={cameraDataSource}
        scroll={{ y: (size[1] || 0) - 200 }} />
      <Table
        locale={{ emptyText: null }}
        rowSelection={{ type: 'radio', onChange: onSelectionChange }}
        pagination={false}
        columns={memoryColumns}
        dataSource={memoryDataSource}
        scroll={{ y: 120 }} />
    </div>
  )
};

export default CameraTable;