'use client';

import { ConfigProvider, theme } from 'antd';
import styles from './page.module.css';
import { useRef } from 'react';
import { useFactoryScene } from '@comp/scene3d/factory';
import Toolbar, { ButtonGroup } from '@comp/toolbar';
import { SettingsMenu, SettingsMenuRef } from '@comp/settings-menu';
import PageFlexLayout from '@comp/flex-layout/layout';
import { GlobalStateProvider, useGlobalState } from '@hooks/global-state';
import { useFactory } from '@hooks/factory-core';
import { SharedSceneProvider } from '@hooks/shared-scene';

function Content() {
  const { state: { paused }, dispatch } = useGlobalState();
  const settingsMenuRef = useRef<SettingsMenuRef>(null);
  const { sendPause, connectServer, statusGetter } = useFactory();
  const factoryScene = useFactoryScene(statusGetter);
  const settingsButton = {
    id: 'settings',
    icon: '/icons/settings.svg',
    label: '',
    onClick: settingsMenuRef.current?.open,
  };
  const pauseButton = {
    id: 'pause',
    icon: paused ? '/icons/play.svg' : '/icons/pause.svg',
    label: '',
    onClick: () => sendPause(!paused),
  };
  const resetButton = {
    id: 'reset',
    icon: '/icons/reset.svg',
    label: '',
    onclick: null,
  };

  const buttonGroups: ButtonGroup[] = [
    {
      group: 'operation',
      showSelection: false,
      buttons: [settingsButton, pauseButton, resetButton],
    },
    {
      group: 'scene',
      showSelection: true,
      buttons: [
        { id: 'move', icon: '/icons/move.svg', label: 'move', onClick: () => console.log('Apple clicked!') },
        { id: 'rotate', icon: '/icons/rotate.svg', label: 'rotate', onClick: () => console.log('Banana clicked!') },
      ],
    },
  ];

  return (
    <div className={styles.page}>
      <SharedSceneProvider {...factoryScene}>
        <SettingsMenu ref={settingsMenuRef} onClickConnect={connectServer} />
        <Toolbar buttonGroups={buttonGroups} />
        <div className="w-screen h-full flex flex-col">
          <div className="header h-8 text-lg font-sans font-semibold flex items-center px-4">晶圆制造物料配送仿真系统</div>
          <div className="flex-1">
            <PageFlexLayout />
          </div>
        </div>
      </SharedSceneProvider>
    </div>
  );
}

export default function Home() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.compactAlgorithm,
      }}
    >
      <GlobalStateProvider>
        <Content />
      </GlobalStateProvider>
    </ConfigProvider>
  );
}
