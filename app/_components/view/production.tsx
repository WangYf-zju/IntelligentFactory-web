import { useState, useEffect, useRef } from 'react';
import { Table, TableColumnsType, Card, Space, Button } from 'antd';
import { seconds2MMSS } from '@/lib/utils';
import useResizeObserver from '@hooks/resize-observer';

interface ProducingTableDataType {
  key: number;
  id: string;
  pipeline: string;
  location: string;
  currentStep: number;
  remainingTime: string;
}

interface WaitProduceTableDataType {
  key: number;
  pipelineId: string;
  name: string;
  quantity: number;
}

const ProductionMonitor = () => {
  // 生成随机生产进度数据
  const generateProductionData = () => {
    const data = [];
    for (let i = 0; i < 500; i++) {
      data.push({
        key: i,
        id: `ID-${32300 + i}`,
        pipeline: `PL-00${Math.floor(Math.random() * 3) + 1}`,
        location: `设备${Math.floor(Math.random() * 600) + 1}`,
        currentStep: Math.floor(Math.random() * 10),
        remainingTime: seconds2MMSS(Math.floor(Math.random() * 1801))
      });
    }
    return data;
  };

  // 生成随机待生产任务数据
  const generatePendingTasks = () => {
    const data = [];
    const pipelineCount = 3
    for (let i = 0; i < pipelineCount; i++) {
      data.push({
        key: i,
        pipelineId: `PL-00${i + 1}`,
        name: `晶圆${i + 1}加工`,
        quantity: Math.floor(Math.random() * 100) + 50
      });
    }
    return data;
  };

  const [productionData, setProductionData] = useState<ProducingTableDataType[]>([]);
  const [pendingTasks, setPendingTasks] = useState<WaitProduceTableDataType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 模拟数据加载
    setLoading(true);
    setTimeout(() => {
      setProductionData(generateProductionData());
      setPendingTasks(generatePendingTasks());
      setLoading(false);
    }, 50);
  }, []);

  // 生产进度表格列定义
  const productionColumns: TableColumnsType<ProducingTableDataType> = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    { title: '流水线', dataIndex: 'pipeline', width: 60 },
    { title: '物料位置', dataIndex: 'location', width: 80 },
    { title: '当前步骤', dataIndex: 'currentStep', width: 80 },
    { title: '步骤剩余时间', dataIndex: 'remainingTime', width: 100 },
  ];

  // 待生产任务表格列定义
  const pendingTaskColumns: TableColumnsType<WaitProduceTableDataType> = [
    { title: '流水线 ID', dataIndex: 'pipelineId', width: 80 },
    { title: '流水线名称', dataIndex: 'name', width: 100 },
    { title: '剩余数量', dataIndex: 'quantity', width: 100 },
  ];

  const domRef = useRef<HTMLDivElement>(null);
  const size = useResizeObserver(domRef);

  return (
    <div className="h-full" ref={domRef}>
      <Space className="absolute right-5 top-1 z-1">
        <Button size="middle">添加任务</Button>
        <Button size="middle">删除任务</Button>
      </Space>
      <Card title="待生产任务" style={{height: 200}}>
        <Table<WaitProduceTableDataType>
          columns={pendingTaskColumns}
          dataSource={pendingTasks}
          loading={loading}
          scroll={{ y: 120 }}
          pagination={false}
        />
      </Card>
      <Card title="生产进度">
        <Table<ProducingTableDataType>
          columns={productionColumns}
          dataSource={productionData}
          loading={loading}
          scroll={{ y: size[1] - 360 }}
          pagination={{ defaultPageSize: 50, showQuickJumper: true }}
        />
      </Card>
    </div>
  );
};

export default ProductionMonitor;