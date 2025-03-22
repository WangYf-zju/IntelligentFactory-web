import { useMemo } from 'react';
import { useGlobalState } from '@hooks/global-state';
import ResizableTable, { ResizableTableProps } from '@comp/ui/resizable-table';

const CameraTable = () => {
  const { state: { nodes }, dispatch } = useGlobalState();

  const data = useMemo(() => {
    return Object.values(nodes).filter(n => n.cameraInfo.camera).map(n => {
      const camera = n.cameraInfo.camera;
      const px = Math.round(camera!.position.x * 100) / 100;
      const py = Math.round(camera!.position.y * 100) / 100;
      const pz = Math.round(camera!.position.z * 100) / 100;
      return {
        nodeId: n.id,
        rawPosition: camera!.position,
        position: `[${px}, ${py}, ${pz}]`,
      }
    });
  }, [nodes]);
  const props: ResizableTableProps = {
    columns: [
      { key: 'nodeId', name: '结点ID', width: 200 },
      { key: 'position', name: '位置', width: 200 },
    ],
    data,
    buttons: [{ id: 'setControlTarget', label: 'target', type: 'single-toggle' }],
    onClickButton: (rowIndex, buttonId, isActive) => {
      if (buttonId === 'setControlTarget') {
        const pos = data[rowIndex].rawPosition;
        dispatch({
          type: 'setDebugInfo',
          payload: { controlTarget: isActive ? [pos.x, pos.y, pos.z] : undefined }
        });
      }
    }
  }
  return (
    <>
      <ResizableTable {...props} />
    </>
  )
};

export default CameraTable;