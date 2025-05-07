import { useRef, useState } from 'react';
import { Table, TableColumnsType } from 'antd';
import useResizeObserver from '@/lib/hooks/resize-observer';
import { useGlobalState } from '@/lib/hooks/global-state';
import useThrottle from '@/lib/hooks/throttle';

interface RobotTableDataType {
  key: React.Key;
  id: number;
  post: string;
  action: string;
}

const columns: TableColumnsType<RobotTableDataType> = [
  {
    title: '序号',
    dataIndex: 'id',
    width: 50,
  },
  {
    title: '位姿',
    dataIndex: 'post',
    width: 200,
  },
  {
    title: '操作',
    dataIndex: 'action',
  },
];

const dataSource = Array.from({ length: 100 }).map<RobotTableDataType>((_, i) => ({
  key: i,
  id: i,
  post: '',
  action: `${i}`,
}));

const RobotTable = () => {
  const domRef = useRef<HTMLDivElement>(null);
  const size = useResizeObserver(domRef);
  const { state: { status, paused } } = useGlobalState();
  const [robotTableData, setRobotTableData] = useState();
  const getRobotTableData = () => {
    status?.robotsList.map(r => {
      return {
        key: r.id,
        id: r.id,
        
      }
    });
  };
  useThrottle(getRobotTableData, 1000);
  return (
    <div className="w-full h-full overflow-hidden" ref={domRef}>
      <Table<RobotTableDataType>
        columns={columns}
        dataSource={dataSource}
        pagination={false}
        scroll={{ y: (size[1] || 0) - 40  }}
      />
    </div>
  )
};

export default RobotTable;