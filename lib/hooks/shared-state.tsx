import { useRef, useContext, createContext, ReactNode, useCallback } from 'react';
import { useFactoryTrack } from '@hooks/factory-core';

interface SharedStateType {
  tracks: {
    lineTracks: ReturnType<typeof useFactoryTrack>['lineTracks'];
    arcTracks: ReturnType<typeof useFactoryTrack>['arcTracks'];
  };
  robots: { [key: number]: [number, number, number, number] };
}

const SharedStateContext = createContext<{
  getState?: () => SharedStateType;
  setState?: (s: Partial<SharedStateType>) => void;
}>({});

export const SharedStateProvider = ({ children }: { children: ReactNode }) => {
  const state = useRef<SharedStateType>({
    tracks: { lineTracks: [], arcTracks: [] },
    robots: {}
  });
  const getState = useCallback(() => state.current, []);
  const setState = useCallback((s: Partial<SharedStateType>) => {
    state.current = ({ ...state.current, ...s });
  }, []);

  return (
    <SharedStateContext.Provider value={{ getState, setState }}>
      {children}
    </SharedStateContext.Provider>
  )
};

export const useSharedState = () => {
  const { getState, setState } = useContext(SharedStateContext);
  if (!getState || !setState) {
    throw new Error('useSharedState must be used within a SharedStateProvider');
  }
  return [getState, setState] as [typeof getState, typeof setState];
};