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
  {
    key: 'default',
    component: 'default',
    label: '默认',
  },
  {
    key: 'canvas3d',
    component: 'canvas3d',
    label: '3D',
  },
  {
    key: 'canvas3d_debug',
    component: 'canvas3d_debug',
    label: '3D调试',
  },
  {
    key: 'camera_list',
    component: 'camera_list',
    label: '相机列表',
  }
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
          {
            type: 'column',
            children: [
              {
                type: 'tabset',
                children: [
                  {
                    type: 'tab',
                    name: '3D调试',
                    component: 'canvas3d_debug',
                  },
                ],
              },
              {
                type: 'tabset',
                children: [
                  {
                    type: 'tab',
                    name: '相机列表',
                    component: 'camera_list',
                  },
                ],
              },
            ],
          }
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