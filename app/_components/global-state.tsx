import { createContext, useContext, Dispatch, useReducer } from 'react';
import { FactoryScene } from '@/lib/generated_files/scene_pb';
import { FactoryStatus } from '@/lib/generated_files/status_pb';

interface GlobalState {
  loading: number;
  scene?: FactoryScene.AsObject;
  status?: FactoryStatus.AsObject;
}

type Action =
  | { type: 'setScene'; payload: FactoryScene.AsObject }
  | { type: 'setStatus'; payload: FactoryStatus.AsObject }
  | { type: 'increaseLoading' }
  | { type: 'decreaseLoading' }

const initialState: GlobalState = {
  loading: 0,
};

const GlobalStateContext = createContext<{
  state: GlobalState;
  dispatch: Dispatch<Action>;
}>({
  state: initialState,
  dispatch: () => null,
});

function globalReducer(state: GlobalState, action: Action): GlobalState {
  switch (action.type) {
    case 'setScene':
      return { ...state, scene: action.payload };
    case 'setStatus':
      return { ...state, status: action.payload };
    case 'increaseLoading':
      return { ...state, loading: state.loading + 1 };
    case 'decreaseLoading':
      return { ...state, loading: state.loading - 1 };
    default:
      throw new Error(`Unhandled action type: ${(action as Action).type}`);
  }
}

export function GlobalStateProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(globalReducer, initialState);

  return (
    <GlobalStateContext.Provider value={{ state, dispatch }}>
      {children}
    </GlobalStateContext.Provider>
  );
}

export function useGlobalState() {
  const context = useContext(GlobalStateContext);
  if (!context) {
    throw new Error('useGlobalState must be used within a GlobalStateProvider');
  }
  return context;
}