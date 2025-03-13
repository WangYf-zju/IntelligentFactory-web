import { useMemo, useState } from 'react';
import { useGlobalState } from '@comp/global-state';
import { FactoryTracks } from '@comp/scene3d/track';
import { FactoryDevices } from '@comp/scene3d/device';
import { Robot } from '@comp/scene3d/robot';

function Factory() {
  const { state: { scene }, dispatch } = useGlobalState();

  return (
    <>
      {scene && <FactoryTracks scene={scene} />}
      {scene && <FactoryDevices scene={scene} />}
      <Robot />
    </>
  );
}

export default Factory;