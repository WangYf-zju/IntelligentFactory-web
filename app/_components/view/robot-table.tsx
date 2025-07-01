import { useEffect, useMemo, useRef, useState } from 'react';
import { Table, TableColumnsType, Button, Space } from 'antd';
import useResizeObserver from '@hooks/resize-observer';
import { useGlobalState } from '@hooks/global-state';
import { useFactoryTrack } from '@hooks/factory-core';
import { round, seconds2MMSS } from '@/lib/utils';
import { RobotWorkState, RobotWorkStateMap } from '@/lib/generated_files/status_pb';

interface RobotTableDataType {
  key: React.Key;
  id: number;
  workState: RobotWorkStateMap[keyof RobotWorkStateMap];
  post: string;
  d2Goal: string | number;
  t2Goal: string;
  speed: string | number;
  task: string | number;
}

const columns: TableColumnsType<RobotTableDataType> = [
  { title: 'ID', dataIndex: 'id', width: 40 },
  { title: '操作', width: 110 },
  {
    title: '工作状态',
    dataIndex: 'workState',
    width: 70,
    render: (value, record, index) => {
      const state = value === RobotWorkState.IDLE ? '空闲' :
        value === RobotWorkState.TASKASSIGNED ? '任务分配' :
          value === RobotWorkState.WAITPICK ? '取货装卸' :
            value === RobotWorkState.FOUPPICKED ? '任务执行' :
              value === RobotWorkState.WAITPLACE ? '交货装卸' : '未知';
      const color = value === RobotWorkState.IDLE ? 'text-green-500' : 'text-yellow-500';
      return (
        <span className={color}>{state}</span>
      )
    }
  },
  { title: '位姿 (x, y, z, r)', dataIndex: 'post', width: 150 },
  { title: '剩余距离(m)', dataIndex: 'd2Goal', width: 90 },
  { title: '预计到达时间', dataIndex: 't2Goal', width: 100 },
  { title: '速度', dataIndex: 'speed', width: 60 },
  { title: '任务 ID', dataIndex: 'task', width: 80 },
];

const RobotTable = () => {
  const domRef = useRef<HTMLDivElement>(null);
  const size = useResizeObserver(domRef);
  const { state: { scene, status }, dispatch } = useGlobalState();
  const { getWorldPost } = useFactoryTrack(scene);
  const [toggle, setToggle] = useState<{ [key: number]: { signal: boolean; path: boolean; } }>({});
  useEffect(() => {
    const t: typeof toggle = {};
    status?.robotsList.forEach(r => {
      t[r.id] = r.id in toggle ? toggle[r.id] : { signal: true, path: false };
    });
    setToggle(t);
  }, [status]);
  const robotDataSource: RobotTableDataType[] = useMemo(() => {
    return status?.robotsList.map(robot => {
      const state = robot.state;
      // let state = Math.floor(Math.random() * 5) as any;
      // if (state === RobotWorkState.WAITPICK || state === RobotWorkState.WAITPLACE)
      //   state = 1
      const moving = state === RobotWorkState.FOUPPICKED || state === RobotWorkState.TASKASSIGNED;
      const [x, y, z, r] = getWorldPost(robot.pos!);
      const post = `(${round(x, 2)}, ${round(y, 2)}, ${round(z, 2)}, ${round(r / Math.PI * 180, 2)})`;
      return {
        key: robot.id,
        id: robot.id,
        workState: state,
        post,
        d2Goal: moving && robot.distanceToEnd !== undefined ? round(robot.distanceToEnd, 2) : '',
        t2Goal: moving && robot.timeToEnd !== undefined ? seconds2MMSS(robot.timeToEnd) : '',
        speed: round(robot.speed, 2),
        task: moving && robot.taskId >= 0 ? robot.taskId + 232 : '',
      }
    }) || [];
  }, [status, getWorldPost]);
  columns[1].render = (value, record, index) => {
    const { signal = true, path = false } = toggle[record.id] || {};
    const onToggle = (button: 'signal' | 'path') => {
      const t = { ...toggle };
      t[record.id][button] = !t[record.id][button];
      setToggle(t);
      if (button === 'signal') {
        dispatch({ type: 'changeRobotPluse', payload: { id: record.id, show: t[record.id][button] } });
      } else if (button === 'path') {
        dispatch({ type: 'changeRobotPath', payload: { id: record.id, show: t[record.id][button] } });
      }
    }
    return (
      <Space>
        <Button type={signal ? 'primary' : 'default'} size='small'
          onClick={() => onToggle('signal')}>
          信号
        </Button>
        <Button type={path ? 'primary' : 'default'} size='small'
          onClick={() => onToggle('path')}>
          路径
        </Button>
      </Space>
    )
  }

  return (
    <div className="w-full h-full overflow-hidden" ref={domRef}>
      <Table<RobotTableDataType>
        locale={{ emptyText: '暂无数据' }}
        pagination={false}
        scroll={{ y: (size[1] || 0) - 40 }}
        columns={columns}
        dataSource={robotDataSource}
      />
    </div>
  )
};

export default RobotTable;