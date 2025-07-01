import { useRef, useState } from 'react';
import {
  Actions,
  BorderNode,
  IJsonModel,
  ITabRenderValues,
  ITabSetRenderValues,
  Layout,
  Model,
  TabNode,
  TabSetNode
} from 'flexlayout-react';
import LayoutTabContent, { LayoutTabMenuItem } from '@comp/flex-layout/layout-tab';
import layoutFactory from '@comp/flex-layout/layout-factory';
import { useGlobalState } from '@hooks/global-state';

const TabMenu = [
  { key: 'default', component: 'default', label: '欢迎' },
  { key: 'canvas3d', component: 'canvas3d', label: '3D' },
  // { key: 'canvas3d_debug', component: 'canvas3d_debug', label: '3D调试' },
  { key: 'camera', component: 'camera', label: '视角管理' },
  // { key: 'scene_object', component: 'scene_object', label: '场景管理' },
  { key: 'robot_table', component: 'robot_table', label: '天车状态' },
  { key: 'device_table', component: 'device_table', label: '加工设备状态' },
  // { key: 'production', component: 'production', label: '生产流水线' },
  // { key: 'history', component: 'history', label: '历史数据统计' },
];

const PageFlexLayout = () => {
  const { dispatch } = useGlobalState();
  const layoutRef = useRef<Layout>(null);
  const [model, setModel] = useState(() => {
    const json: IJsonModel = {
      global: {},
      borders: [],
      layout: {
        type: 'row',
        children: [
          {
            type: 'tabset',
            children: [
              {
                type: 'tab',
                name: '3D',
                component: 'canvas3d',
              },
            ],
          },
        ],
      },
    };
    return Model.fromJson(json);
  });

  const onAddFromTabSetButton = (node: TabSetNode | BorderNode) => {
    layoutRef.current?.addTabToTabSet(node.getId(), {
      type: 'tab',
      name: 'default',
      component: "default",
    });
  };

  const onRenderLayouotTab = (node: TabNode, renderValues: ITabRenderValues) => {
    const onClickMenu = (node: TabNode, item: LayoutTabMenuItem) => {
      dispatch({
        type: 'setNodeInfo',
        payload: { id: node.getId(), info: { component: item.component } }
      });
      model.doAction(Actions.updateNodeAttributes(node.getId(),
        { component: item.component, name: item.label }));
      // setModel(Model.fromJson(model.toJson()));
    };
    renderValues.content = (
      <LayoutTabContent node={node} menuItems={TabMenu} onClickMenu={onClickMenu} />
    );
  };

  const onRenderTabSet = (node: (TabSetNode | BorderNode), renderValues: ITabSetRenderValues) => {
    if (node instanceof TabSetNode) {
      renderValues.stickyButtons.push(
        <div key='btnadd'
          className='flexlayout__tab_toolbar_button h-8 flex items-center'
          onClick={() => onAddFromTabSetButton(node)}
        >
          <div className='h-4 w-4'>
            <img src='icons/add.svg' />
          </div>
        </div>
      );
    }
  }

  return (
    <>
      <Layout
        ref={layoutRef}
        model={model}
        factory={layoutFactory}
        onRenderTab={onRenderLayouotTab}
        onRenderTabSet={onRenderTabSet}
      />
    </>
  );
};

export default PageFlexLayout;