import { useEffect, useRef, useContext, createContext, ReactNode, useCallback } from 'react';
import * as THREE from 'three';

interface SharedSceneProviderProps {
  children?: ReactNode;
  frameCallback?: (scene: THREE.Scene, dt: number) => void;
}

function useCustomFrame(callback: (dt: number) => void) {
  const frameRef = useRef(-1);
  const time = useRef(-1);

  const animate = (t: number) => {
    const dt = time.current > 0 ? t - time.current : 0;
    time.current = t;
    if (callback) callback(dt / 1000);
    frameRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [callback]);
}

const scene = new THREE.Scene();
const SharedSceneContext = createContext<THREE.Scene | null>(null);
export const SharedSceneProvider = (props: SharedSceneProviderProps) => {
  const { children, frameCallback } = props;
  const scene = useRef(new THREE.Scene());
  const callback = useCallback((dt: number) => {
    frameCallback?.(scene.current, dt);
  }, [frameCallback]);
  useCustomFrame(callback);
  
  return (
    <SharedSceneContext.Provider value={scene.current}>
      {children}
    </SharedSceneContext.Provider>
  );
};

export const useSharedScene = () => {
  const scene = useContext(SharedSceneContext);
  if (!scene) {
    throw new Error('useSharedScene must be used within a SharedSceneProvider');
  }
  return scene;
};