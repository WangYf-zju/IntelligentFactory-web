import { lazy, memo, Suspense, useEffect, useMemo } from 'react';
import { TabNode } from 'flexlayout-react';
import { useGlobalState } from '@hooks/global-state';
import CameraTable from '@comp/view/camera';
import SceneObjectTree from '@comp/view/scene-object';
import RobotTable from '../view/robot-table';
import DeviceTable from '../view/device-table';
import ProductionMonitor from '../view/production';
import HistoryStatistic from '../view/history-statistic';
const Canvas3d = lazy(() => import('@comp/canvas-3d'));

const LoadingMask = () => {
  return (
    <div className="absolute left-0 right-0 top-0 bottom-0 
      inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="animate-spin rounded-full h-12 w-12 
        border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
};

const DefaultComponent = () => <div>default</div>;

const Factory = memo(({ nodeId, component }: { nodeId: string, component: string }) => {
  return (
    <>
      {component === 'default' && <DefaultComponent />}
      {component === 'canvas3d' && <Suspense fallback={<LoadingMask />}><Canvas3d nodeId={nodeId} /></Suspense>}
      {component === 'canvas3d_debug' &&
        <Suspense fallback={<LoadingMask />}>
          <Canvas3d nodeId={nodeId} debug />
        </Suspense>}
      {component === 'camera' && <CameraTable />}
      {component === 'scene_object' && <SceneObjectTree />}
      {component === 'robot_table' && <RobotTable />}
      {component === 'device_table' && <DeviceTable />}
      {component === 'production' && <ProductionMonitor />}
      {component === 'history' && <HistoryStatistic />}
    </>
  )
});

const LayoutFactory = ({ node }: { node: TabNode }) => {
  const { state: { nodes }, dispatch } = useGlobalState();
  const nodeId = node.getId();
  const component = useMemo(() => {
    return nodes[node.getId()]?.component || 'default';
  }, [nodes]);

  useEffect(() => {
    dispatch({ type: 'registerNode', payload: nodeId });
    return () => {
      dispatch({ type: 'unregisterNode', payload: nodeId });
    };
  }, []);

  return (
    <Factory nodeId={nodeId} component={component} />
  );
};

const layoutFactory = (node: TabNode) => <LayoutFactory node={node} />;

export default layoutFactory;