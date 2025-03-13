import { useState, useCallback } from 'react';

type AsyncFunction<T> = () => Promise<T>;

interface UseAsyncResult<T> {
  loading: boolean;
  data: T | null;
  error: Error | null;
  execute: () => Promise<void>;
}

function useAsync<T>(asyncFunction: AsyncFunction<T>): UseAsyncResult<T> {
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await asyncFunction();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
    } finally {
      setLoading(false);
    }
  }, [asyncFunction]);

  return { loading, data, error, execute };
}

export default useAsync;