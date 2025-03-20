import { useState, useCallback } from 'react';

type AsyncFunction<T> = () => Promise<T>;

interface UseAsyncResult<T> {
  loading: boolean;
  data: T | undefined;
  error: Error | undefined;
  execute: () => Promise<void>;
}

function useAsync<T>(asyncFunction: AsyncFunction<T>): UseAsyncResult<T> {
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<T | undefined>();
  const [error, setError] = useState<Error | undefined>();

  const execute = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      const result = await asyncFunction();
      setData(result);
      setError(undefined);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An error occurred'));
    } finally {
      setLoading(false);
    }
  }, [asyncFunction]);

  return { loading, data, error, execute };
}

export default useAsync;