import { createContext, useContext, Dispatch, useReducer, act } from 'react';
import * as THREE from 'three';
import { FactoryScene } from '@/lib/generated_files/scene_pb';
import { FactoryStatus } from '@/lib/generated_files/status_pb';

// type CameraInfo = Omit<ThreeElements['perspectiveCamera'], 'ref' | 'children'>;
type SetNodeInfoPayload = Partial<Omit<NodeInfo, 'id' | 'cameraInfo'>>;

export interface CameraInfo {
  target?: [x: number, y: number, z: number];
  position?: [x: number, y: number, z: number];
  rotation?: [x: number, y: number, z: number];
  quaternion?: [w: number, x: number, y: number, z: number];
  near?: number;
  far?: number;
  fov?: number;
  aspect?: number;
  zoom?: number;
  focus?: number;
}

interface ViewInfo {
  type: 'free' | 'top' | 'follow';
  targetType?: 'robot' | 'device';
  targetId?: number;
  // offset?: [x: number, y: number, z: number];
}

interface NodeInfo {
  id: string;
  component: string;
  cameraInfo: CameraInfo;
  view: ViewInfo;
  needUpdateCamera: boolean;
  camera?: THREE.PerspectiveCamera;
  scene?: THREE.Scene;
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
  robotHidePulse: number[];
  robotShowPath: number[];
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
  | { type: 'setNodeInfo'; payload: { id: string; info: SetNodeInfoPayload } }
  | { type: 'setNodeCameraInfo'; payload: { id: string; info: CameraInfo } }
  | { type: 'changeNodeCameraInfo'; payload: { id: string; info: CameraInfo } }
  | { type: 'changeRobotPluse'; payload: { id: number, show: boolean } }
  | { type: 'changeRobotPath'; payload: { id: number, show: boolean } }
  | { type: 'setDebugInfo'; payload: DebugInfo }

const initialState: GlobalState = {
  loading: 0,
  connected: false,
  paused: true,
  mouseButtonFunction: 'move',
  nodes: {},
  robotHidePulse: [],
  robotShowPath: [],
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
    view: { type: 'free' },
    needUpdateCamera: false,
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

const setNodeInfo = (state: GlobalState, id: string, info: SetNodeInfoPayload) => {
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

const setNodeCameraInfo = (state: GlobalState, id: string, info: CameraInfo, needUpdate = false) => {
  if (state.nodes[id] === undefined) {
    console.warn(`Node ${id} is not exist`);
    return state;
  }
  // 需要更新相机状态，忽略设置请求
  if (needUpdate === false && state.nodes[id].needUpdateCamera === true)
    return state;
  state.nodes[id].cameraInfo = {
    ...state.nodes[id].cameraInfo,
    ...info,
  };
  state.nodes[id].needUpdateCamera = needUpdate;
  return { ...state, nodes: { ...state.nodes } };
};

const changeRobotPulse = (state: GlobalState, id: number, show: boolean) => {
  const robotPluse = [...state.robotHidePulse];
  const i = robotPluse.indexOf(id);
  if (show) {
    i >= 0 && robotPluse.splice(i, 1);
  } else {
    i < 0 && robotPluse.push(id);
  }
  return { ...state, robotHidePulse: robotPluse };
};

const changeRobotPath = (state: GlobalState, id: number, show: boolean) => {
  const robotPath = [...state.robotShowPath];
  const i = robotPath.indexOf(id);
  if (show) {
    i < 0 && robotPath.push(id);
  } else {
    i >= 0 && robotPath.splice(i, 1);
  }
  return { ...state, robotShowPath: robotPath };
};

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
    case 'changeNodeCameraInfo':
      return setNodeCameraInfo(state, action.payload.id, action.payload.info, true);
    case 'changeRobotPluse':
      return changeRobotPulse(state, action.payload.id, action.payload.show);
    case 'changeRobotPath':
      return changeRobotPath(state, action.payload.id, action.payload.show);
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