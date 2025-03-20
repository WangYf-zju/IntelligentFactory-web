import React from 'react';
import { Layout, Model } from 'flexlayout-react';
import 'flexlayout-react/style/light.css';

const PageFlexLayout: React.FC = () => {
  const model = Model.fromJson({
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
              name: 'Panel 1',
              component: 'panel1',
            },
          ],
        },
        {
          type: 'tabset',
          children: [
            {
              type: 'tab',
              name: 'Panel 2',
              component: 'panel2',
            },
          ],
        },
      ],
    },
  });

  const factory = (node: any) => {
    const component = node.getComponent();
    if (component === 'panel1') {
      return <div>Panel 1 Content</div>;
    }
    if (component === 'panel2') {
      return <div>Panel 2 Content</div>;
    }
    return null;
  };

  return <Layout model={model} factory={factory} />;
};

export default PageFlexLayout;