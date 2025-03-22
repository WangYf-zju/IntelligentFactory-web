import { useState, useEffect, RefObject } from 'react';

function useResizeObserver(targetRef: RefObject<HTMLElement>) {
  const [size, setSize] = useState<[width: number, height: number]>([0, 0]);

  useEffect(() => {
    if (!targetRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        setSize([width, height]);
      }
    });

    resizeObserver.observe(targetRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [targetRef]);

  return size;
}

export default useResizeObserver;