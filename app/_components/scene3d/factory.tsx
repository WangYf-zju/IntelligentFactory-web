import { useMemo, useState } from 'react';
import { useGlobalState } from '@hooks/global-state';
import { FactoryTracks } from '@comp/scene3d/track';
import { FactoryDevices } from '@comp/scene3d/device';

function Factory() {
  const { state: { scene }, dispatch } = useGlobalState();

  return (
    <>
      {scene && <FactoryTracks scene={scene} />}
      {scene && <FactoryDevices scene={scene} />}
    </>
  );
}

export default Factory;