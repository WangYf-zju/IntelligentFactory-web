'use client';

import styles from './page.module.css';
import { useRef } from 'react';
import Toolbar, { ButtonGroup } from '@comp/toolbar';
import { SettingsMenu, SettingsMenuRef } from '@comp/settings-menu';
import PageFlexLayout from '@/app/_components/flex-layout/layout';
import { GlobalStateProvider, useGlobalState } from '@hooks/global-state';
import { useFactory } from '@hooks/factory-core';
import { SharedSceneProvider } from '@/lib/hooks/shared-scene';
import useRobot from '@comp/scene3d/robot';

function Content() {
  const { state: { paused }, dispatch } = useGlobalState();
  const settingsMenuRef = useRef<SettingsMenuRef>(null);
  const { sendPause, connectServer, statusGetter } = useFactory();
  const robot = useRobot(statusGetter);
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
      <SharedSceneProvider frameCallback={robot.frameUpdate}>
        <SettingsMenu ref={settingsMenuRef} onClickConnect={connectServer} />
        <Toolbar buttonGroups={buttonGroups} />
        <div className="w-screen h-screen">
          <PageFlexLayout />
        </div>
      </SharedSceneProvider>
    </div>
  );
}

export default function Home() {
  return (
    <GlobalStateProvider>
      <Content />
    </GlobalStateProvider>
  );
}
