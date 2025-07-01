import { useState, useMemo, Fragment, useEffect, useRef } from 'react';
import useResizeObserver from '@hooks/resize-observer';

export interface ProcessStep {
  id: string;
  name: string;
  startTime: Date;
  endTime: Date;
  color?: string;
  description?: string;
}

export interface Machine {
  id: string;
  name: string;
  processes: ProcessStep[];
}

interface GanttChartProps {
  machines: Machine[];
  initialStartTime?: Date;
  initialEndTime?: Date;
}

type TimeScale = 'minutes' | 'hours' | 'days';

const maxTickCount = 20;

const GanttChart: React.FC<GanttChartProps> = ({
  machines,
  initialStartTime,
  initialEndTime,
}) => {
  // 计算默认时间范围（如果没有提供）
  const calculateDefaultTimeRange = () => {
    if (machines.length === 0) {
      const now = new Date();
      return {
        start: new Date(now.getTime() - 24 * 60 * 60 * 1000), // 24小时前
        end: new Date(now.getTime() + 24 * 60 * 60 * 1000), // 24小时后
      };
    }

    let minStart = new Date();
    let maxEnd = new Date(0);

    machines.forEach((machine) => {
      machine.processes.forEach((process) => {
        if (process.startTime < minStart) minStart = new Date(process.startTime);
        if (process.endTime > maxEnd) maxEnd = new Date(process.endTime);
      });
    });

    // 添加一些边距
    const margin = (maxEnd.getTime() - minStart.getTime()) * 0.1;
    return {
      start: new Date(minStart.getTime() - margin),
      end: new Date(maxEnd.getTime() + margin),
    };
  };

  const defaultRange = calculateDefaultTimeRange();
  const [startTime, setStartTime] = useState<Date>(
    initialStartTime || defaultRange.start
  );
  useEffect(() => setStartTime(initialStartTime || defaultRange.start),
    [initialStartTime, defaultRange.start]);
  const [endTime, setEndTime] = useState<Date>(
    initialEndTime || defaultRange.end
  );
  useEffect(() => setEndTime(initialEndTime || defaultRange.end),
    [initialEndTime, defaultRange.end]);
  const [timeScale, setTimeScale] = useState<TimeScale>('hours');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const ganttContainerRef = useRef<HTMLDivElement>(null);
  const contentContainerRef = useRef<HTMLDivElement>(null);
  const containerSize = useResizeObserver(contentContainerRef);

  const [minZoom, setZoom] = useState<number>(0);
  const [maxZoom, setMaxZoom] = useState<number>(0);

  const { timeTicks, tickInterval, startTimeMs, endTimeMs, contentWidth } = useMemo(() => {
    let interval: number;
    let format: (date: Date) => string;

    const targetTicks = maxTickCount;
    const baseInterval = (endTime.getTime() - startTime.getTime()) / targetTicks;

    switch (timeScale) {
      case 'minutes':
        // 调整为最接近的标准间隔（15, 30, 60分钟）
        if (baseInterval <= 15 * 60 * 1000) {
          interval = 15 * 60 * 1000;
        } else if (baseInterval <= 30 * 60 * 1000) {
          interval = 30 * 60 * 1000;
        } else {
          interval = 60 * 60 * 1000;
        }
        format = (date) =>
          `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
        break;
      case 'hours':
        // 调整为最接近的标准间隔（1, 2, 4, 6, 12小时）
        if (baseInterval <= 1 * 60 * 60 * 1000) {
          interval = 1 * 60 * 60 * 1000;
        } else if (baseInterval <= 2 * 60 * 60 * 1000) {
          interval = 2 * 60 * 60 * 1000;
        } else if (baseInterval <= 4 * 60 * 60 * 1000) {
          interval = 4 * 60 * 60 * 1000;
        } else if (baseInterval <= 6 * 60 * 60 * 1000) {
          interval = 6 * 60 * 60 * 1000;
        } else {
          interval = 12 * 60 * 60 * 1000;
        }
        format = (date) => `${date.getHours()}:00`;
        break;
      case 'days':
        // 调整为最接近的标准间隔（1, 2, 7天）
        if (baseInterval <= 24 * 60 * 60 * 1000) {
          interval = 24 * 60 * 60 * 1000;
        } else if (baseInterval <= 2 * 24 * 60 * 60 * 1000) {
          interval = 2 * 24 * 60 * 60 * 1000;
        } else {
          interval = 7 * 24 * 60 * 60 * 1000;
        }
        format = (date) => `${date.getMonth() + 1}/${date.getDate()}`;
        break;
      default:
        interval = 60 * 60 * 1000;
        format = (date) => date.toLocaleTimeString();
    }

    const ticks = [];

    // 调整起始/终止时间到最近的刻度点
    const startTimeMs = Math.floor(startTime.getTime() / interval) * interval;
    const endTimeMs = Math.max(Math.ceil(endTime.getTime() / interval) * interval,
      startTimeMs + 1000 * 60); // 至少 1 分钟间隔

    let current = startTimeMs;

    let tickCount = 0;
    while (current <= endTimeMs && tickCount < maxTickCount) {
      ticks.push({
        time: new Date(current),
        label: format(new Date(current)),
      });
      current += interval;
      tickCount++;
    }

    return {
      timeTicks: ticks,
      tickInterval: interval,
      startTimeMs,
      endTimeMs,
      contentWidth: (endTimeMs - startTimeMs) * zoomLevel,
    };
  }, [startTime, endTime, timeScale, zoomLevel]);

  // 更新最小缩放比例
  useEffect(() => {
    const zoom = (containerSize[0] - 50) / (endTimeMs - startTimeMs);
    setZoom(zoom);
    setMaxZoom(zoom * 10);
    setZoomLevel(prev => Math.min(zoom * 10, Math.max(zoom, prev)));
  }, [containerSize, startTimeMs, endTimeMs]);

  // 计算时间位置（相对于总时间范围）
  const getPosition = (date: Date) => {
    const ratio = Math.max(0, Math.min(1, (date.getTime() - startTimeMs) / (endTimeMs - startTimeMs)))
    return ratio * contentWidth;
  };

  // 处理缩放
  const handleZoom = (delta: number) => {
    // const newZoom = Math.min(maxZoom, Math.max(minZoom, zoomLevel + delta * 0.2));
    // setZoomLevel(newZoom);
    console.log(zoomLevel)
  };

  // 添加鼠标滚轮缩放事件
  useEffect(() => {
    console.log(111)
    const container = ganttContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        handleZoom(e.deltaY > 0 ? -1 : 1);
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [zoomLevel, minZoom, maxZoom]);

  return (
    <div className="p-4 bg-white rounded-lg shadow text-sm" ref={ganttContainerRef}>

      <div>
        <div className="pl-16" ref={contentContainerRef}>
          {/* 时间轴 */}
          <div className="relative flex h-8 mb-4">
            {timeTicks.map((tick, index) => (
              <>
                <div
                  key={index}
                  className="absolute h-2 border-l border-gray-300"
                  style={{
                    left: getPosition(tick.time),
                  }}
                >
                </div>
                <div className="absolute bottom-0 text-xs text-gray-600 z-10"
                  style={{
                    left: getPosition(tick.time) - 16,
                  }}>
                  {tick.label}
                </div>
              </>
            ))}
          </div>

          <div className="-ml-16 h-80 overflow-y-auto">
            {machines.map((machine) => (
              <div key={machine.id} style={{ width: contentWidth }}>
                <div className="flex">
                  <div className="relative w-16 h-6 flex items-center">
                    {machine.name}
                  </div>
                  <div className="flex-1 relative h-6 border-b border-gray-200">
                    {machine.processes.filter(process => {
                      return process.endTime.getTime() > startTime.getTime() && 
                        process.startTime.getTime() < endTime.getTime()
                    }).map((process) => {
                      const left = getPosition(process.startTime);
                      const width = getPosition(process.endTime) - left;
                      return (
                        <Fragment key={process.id}>
                          <div
                            className="absolute h-4 top-1 rounded"
                            style={{
                              left,
                              width,
                              backgroundColor: process.color || '#4f46e5',
                            }}
                          />
                          {/* <Tooltip id={`tooltip-${process.id}`} place="top">
                            <div className="p-2 max-w-xs">
                              <h3 className="font-bold">{process.name}</h3>
                              <p>
                                {process.startTime.toLocaleString()} -{' '}
                                {process.endTime.toLocaleString()}
                              </p>
                              {process.description && (
                                <p className="mt-1">{process.description}</p>
                              )}
                            </div>
                          </Tooltip> */}
                        </Fragment>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

};

export default GanttChart;