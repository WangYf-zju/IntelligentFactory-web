'use client';

import styles from './page.module.css';
import { useMemo, useRef } from 'react';
import Canvas3d from '@comp/canvas-3d';
import Toolbar, { ButtonGroup } from '@comp/toolbar';
import { GlobalStateProvider, useGlobalState } from '@hooks/global-state';
import { useFactory } from '@hooks/factory-core';
import PageFlexLayout from '@comp/layout';
import { SettingsMenu, SettingsMenuRef } from './_components/settings-menu';

const LoadingMask = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
};

function Content() {
  const { state: { paused }, dispatch } = useGlobalState();
  const settingsMenuRef = useRef<SettingsMenuRef>(null);
  const { sendPause, connectServer } = useFactory();
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
      <SettingsMenu ref={settingsMenuRef} onClickConnect={connectServer} />
      <Toolbar buttonGroups={buttonGroups} />
      {/* <PageFlexLayout /> */}
      <div className="w-screen h-screen">
        <Canvas3d />
      </div>
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
