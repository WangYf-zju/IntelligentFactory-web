import { useMemo, useRef } from 'react';
import { Table, TableColumnsType } from 'antd';
import useResizeObserver from '@hooks/resize-observer';
import { useGlobalState } from '@hooks/global-state';
import { DeviceStatus, FoupStatus } from '@/lib/generated_files/status_pb';
import { seconds2MMSS } from '@/lib/utils';

interface DeviceTableDataType {
  key: React.Key;
  id: number;
  type: string;
  foup: number[];
  curFoup: number;
  process: string | number;
  progress: string | number;
  cycleRemain: string;
}

const columns: TableColumnsType<DeviceTableDataType> = [
  { title: 'ID', dataIndex: 'id', width: 40 },
  // { title: '操作', width: 60 },
  { title: '类型', dataIndex: 'type', width: 60 },
  {
    title: 'FOUP 端口',
    width: 100,
    render: (value, record, index) => {
      const i = record.foup.findIndex(v => v === record.curFoup);
      return i >= 0 ?
        (
          <>
            {i > 0 && <span>{record.foup.slice(0, i).join(' | ')}</span>}
            <span className='text-color-red'>{record.curFoup}</span>
            {i < record.foup.length - 1 && <span>{record.foup.slice(i+1).join(' | ')}</span>}
          </>
        ) : (
          <span>{record.foup.join(' | ')}</span>
        )
    }
  },
  { title: '流水线', dataIndex: 'process', width: 80 },
  { title: '进度', dataIndex: 'progress', width: 80 },
  { title: '剩余时间', dataIndex: 'cycleRemain', width: 80 },
]

const DeviceTable = () => {
  const domRef = useRef<HTMLDivElement>(null);
  const size = useResizeObserver(domRef);
  const { state: { scene, status } } = useGlobalState();
  const deviceDataSource: DeviceTableDataType[] = useMemo(() => {
    console.log(status?.devicesList)
    const deviceStatus: { [key: number]: DeviceStatus.AsObject } = {};
    const foupStatus: { [key: number]: FoupStatus.AsObject } = {};
    status?.devicesList.forEach(d => deviceStatus[d.id] = d);
    status?.foupsList.forEach(t => foupStatus[t.id] = t);
    return scene?.devicesList.map(d => {
      const { foupCache, foupId = -1, cycleRtime = Math.random() * 1000 } = deviceStatus[d.id] || {};
      const { count = -1, processed = -1, lineId = -1, stage = -1 } = foupStatus[foupId] || {};
      const process = lineId >= 0 && stage >= 0 ? `${lineId} - ${stage}` : '';
      const progress = count >= 0 && processed >= 0 ? `${processed} / ${count}` : '';
      const cycleRemain = cycleRtime >= 0 ? `${seconds2MMSS(cycleRtime)}` : '';
      return {
        key: d.id,
        id: d.id,
        // type: d.type.toUpperCase(),
        type: "光刻",
        foup: foupCache?.idsList.length ? foupCache?.idsList : [Math.ceil(Math.random() * 300)],
        curFoup: foupId,
        process: 1,
        progress: Math.ceil(Math.random() * 30),
        cycleRemain: seconds2MMSS(Math.random() * 3000),
      };
    }) || [];
  }, [scene, status]);
  return (
    <div className="w-full h-full overflow-hidden" ref={domRef}>
      <Table<DeviceTableDataType>
        locale={{ emptyText: '暂无数据' }}
        scroll={{ y: (size[1] || 0) - 80 }}
        pagination={{ defaultPageSize: 50, showQuickJumper: true }}
        columns={columns}
        dataSource={deviceDataSource}
      />
    </div>
  );
}

export default DeviceTable;