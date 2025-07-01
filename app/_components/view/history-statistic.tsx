import React, { useMemo, useState } from "react";
import GanttChart, { ProcessStep, Machine } from '@comp/gantt';
import { Button, Card, DatePicker, Select, Space } from "antd";
import dayjs from 'dayjs';
import { round } from "@/lib/utils";

// 生成随机颜色
function getRandomColor(): string {
  // 预定义的50种颜色，确保视觉区分度
  const colors = [
    '#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6',
    '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
    '#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A',
    '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
    '#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC',
    '#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399',
    '#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680',
    '#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933',
    '#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3',
    '#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF',
    '#FF8C1A', '#E6E600', '#7F00FF', '#CCFF00', '#0040FF',
    '#990000', '#FF9999', '#00CC99', '#9966FF', '#99CC00'
  ];

  return colors[Math.floor(Math.random() * colors.length)];
}

// 生成随机描述
function getRandomDescription(): string {
  const descriptions = [
    '搬运零件A到装配线',
    '运输成品到仓库',
    '从仓库取原材料',
    '移动工具到工作站',
    '清理工作区域',
    '协助人工操作员',
    '例行巡检任务',
    '紧急物料运输',
    '设备维护搬运',
    '样本传递任务'
  ];
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

// 生成随机日期，在指定范围内
function getRandomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// 生成机器人的任务列表
function generateRobotProcesses(robotId: string, startTime: Date, endTime: Date) {
  const processes: ProcessStep[] = [];
  let currentTime = new Date(startTime.getTime());

  // 平均5分钟(300000毫秒)一个任务
  while (currentTime < endTime) {
    // 随机任务持续时间30-120秒
    const duration = 30000 + Math.random() * 90000; // 30s-120s
    const taskEndTime = new Date(currentTime.getTime() + duration);

    // 确保任务不超过结束时间
    if (taskEndTime > endTime) break;

    processes.push({
      id: `task-${robotId}-${processes.length + 1}`,
      name: '',
      startTime: new Date(currentTime.getTime()),
      endTime: taskEndTime,
      color: getRandomColor(),
      description: getRandomDescription()
    });

    // 移动到下一个任务的开始时间（平均5分钟间隔）
    const nextTaskDelay = 240000 + Math.random() * 120000; // 4-6分钟
    currentTime = new Date(taskEndTime.getTime() + nextTaskDelay);
  }

  return processes;
}

// 生成机器人数据
function generateRobots(count: number) {
  const robots: Machine[] = [];
  const startTime = new Date('2025-04-01T16:00:00');
  const endTime = new Date('2025-04-02T12:00:00');

  for (let i = 1; i <= count; i++) {
    const robotId = `robot-${i.toString().padStart(3, '0')}`;
    robots.push({
      id: robotId,
      name: `天车${i}`,
      processes: generateRobotProcesses(robotId, startTime, endTime)
    });
  }

  return robots;
}

const HistoryStatistic = () => {
  const machines = useMemo(() => generateRobots(50), []);
  const [startTime, setStartTime] = useState<Date>(new Date('2025-04-01T16:00:00'));
  const [endTime, setEndTime] = useState<Date>(new Date('2025-04-01T20:00:00'));
  const taskTime = useMemo(() => {
    const tasks: number[] = [];
    machines.forEach(m => {
      const time = m.processes.filter(
        p => p.startTime.getTime() < endTime.getTime()
          && p.endTime.getTime() > startTime.getTime()
      ).map(p => Math.min(p.endTime.getTime(), endTime.getTime())
        - Math.max(p.startTime.getTime(), startTime.getTime()));
      tasks.push(...time);
    });
    return tasks;
  }, [machines, startTime, endTime]);
  return (
    <div className="p-2 text-sm">
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <Select className="w-25"
          options={[
            { value: 'robot', label: '天车配送' },
            { value: 'device', label: '设备加工' },
          ]} />
        <span>开始时间</span>
        <DatePicker showTime value={dayjs(startTime)}
          onChange={(date, dateString) => setStartTime(date.toDate())} />
        <span>结束时间</span>
        <DatePicker showTime value={dayjs(endTime)}
          onChange={(date, dateString) => setEndTime(date.toDate())} />
        {/* <span>时间刻度</span>
        <Select className="w-15" value={timeScale}
          onChange={(v) => setTimeScale(v)}
          options={[
            { value: 'minutes', label: '分钟' },
            { value: 'hours', label: '小时' },
            { value: 'days', label: '天' },
          ]} /> */}
        <Button>导出数据</Button>
      </div>

      <GanttChart
        machines={machines}
        initialStartTime={startTime}
        initialEndTime={endTime}
      />

      <div className="mt-4">
        <Card title="统计结果">
          <Space size={20}>
            <span>任务总数：{taskTime.length}</span>
            <span>配送总时间：{round(taskTime.reduce((prev, cur) => prev + cur, 0) / 1000, 1)}s</span>
            <span>平均配送时间：
              {round(taskTime.reduce((prev, cur) => prev + cur, 0) / 1000 / taskTime.length, 2)}s
            </span>
            <span>平均拥堵时间：{'0.34s'}</span>
            <span>天车使用率：
              {round(taskTime.reduce((prev, cur) => prev + cur, 0) * 100 /
                (machines.length * (endTime.getTime() - startTime.getTime())), 2)
              }%
            </span>
          </Space>
        </Card>
      </div>
    </div>
  );
};

export default HistoryStatistic;