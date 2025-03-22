import { createContext, useContext, Dispatch, useReducer, act } from 'react';
import * as THREE from 'three';
import { ThreeElements } from '@react-three/fiber';
import { FactoryScene } from '@/lib/generated_files/scene_pb';
import { FactoryStatus } from '@/lib/generated_files/status_pb';

type CameraInfo = Omit<ThreeElements['perspectiveCamera'], 'ref' | 'children'>
  & { camera?: THREE.PerspectiveCamera };

interface NodeInfo {
  id: string;
  component: string;
  cameraInfo: CameraInfo;
}

interface DebugInfo {
  controlTarget?: [x: number, y: number, z: number];
}

interface GlobalState {
  loading: number;
  connected: boolean;
  paused: boolean;
  scene?: FactoryScene.AsObject;
  status?: FactoryStatus.AsObject;
  mouseButtonFunction: 'move' | 'rotate';
  nodes: { [key: string]: NodeInfo };
  debug: DebugInfo;
}

type Action =
  | { type: 'increaseLoading' }
  | { type: 'decreaseLoading' }
  | { type: 'setConnected', payload: boolean }
  | { type: 'setPaused'; payload: boolean }
  | { type: 'setScene'; payload: FactoryScene.AsObject }
  | { type: 'setStatus'; payload: FactoryStatus.AsObject }
  | { type: 'setMouseButtonFunction'; payload: 'move' | 'rotate' }
  | { type: 'registerNode'; payload: string }
  | { type: 'unregisterNode'; payload: string }
  | { type: 'setNodeInfo'; payload: { id: string; info: Omit<NodeInfo, 'id' | 'cameraInfo'> } }
  | { type: 'setNodeCameraInfo'; payload: { id: string; info: CameraInfo } }
  | { type: 'setDebugInfo'; payload: DebugInfo }

const initialState: GlobalState = {
  loading: 0,
  connected: false,
  paused: true,
  mouseButtonFunction: 'move',
  nodes: {},
  debug: {},
};

const GlobalStateContext = createContext<{
  state: GlobalState;
  dispatch: Dispatch<Action>;
}>({
  state: initialState,
  dispatch: () => null,
});

const registerNode = (state: GlobalState, id: string) => {
  state.nodes[id] = {
    id: id,
    component: 'default',
    cameraInfo: {},
  };
  return { ...state, nodes: { ...state.nodes } };
};

const unregisterNode = (state: GlobalState, id: string) => {
  if (state.nodes[id] === undefined) {
    return state;
  }
  delete state.nodes[id];
  return { ...state, nodes: { ...state.nodes } };
};

const setNodeInfo = (state: GlobalState, id: string, info: Omit<NodeInfo, 'id' | 'cameraInfo'>) => {
  if (state.nodes[id] === undefined) {
    console.warn(`Node ${id} is not exist`);
    return state;
  }
  state.nodes[id] = {
    ...state.nodes[id],
    ...info,
  };
  return { ...state, nodes: { ...state.nodes } };
};

const setNodeCameraInfo = (state: GlobalState, id: string, info: CameraInfo) => {
  if (state.nodes[id] === undefined) {
    console.warn(`Node ${id} is not exist`);
    return state;
  }
  state.nodes[id].cameraInfo = {
    ...state.nodes[id].cameraInfo,
    ...info,
  };
  return { ...state, nodes: { ...state.nodes } };
}

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
    case 'setConnected':
      return { ...state, connected: action.payload };
    case 'setPaused':
      return { ...state, paused: action.payload };
    case 'setMouseButtonFunction':
      return { ...state, mouseButtonFunction: action.payload };
    case 'registerNode':
      return registerNode(state, action.payload);
    case 'unregisterNode':
      return unregisterNode(state, action.payload);
    case 'setNodeInfo':
      return setNodeInfo(state, action.payload.id, action.payload.info);
    case 'setNodeCameraInfo':
      return setNodeCameraInfo(state, action.payload.id, action.payload.info);
    case 'setDebugInfo':
      return { ...state, debug: { ...state.debug, ...action.payload } };
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