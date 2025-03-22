import { useRef, useCallback } from "react";

/**
 * 节流 Hook
 * @param callback - 需要节流的函数
 * @param delay - 节流时间间隔（毫秒）
 * @returns 节流后的函数
 */
const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  const lastExecuted = useRef<number>(Date.now()); // 上一次执行的时间戳

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastExecuted.current >= delay) {
        // 如果距离上一次执行的时间超过了 delay，则执行函数
        callback(...args);
        lastExecuted.current = now; // 更新上一次执行的时间
      }
    },
    [callback, delay]
  );

  return throttledCallback;
};

export default useThrottle;