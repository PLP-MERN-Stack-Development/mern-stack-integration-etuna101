import { useCallback, useState } from 'react';

export default function useApi(asyncFn) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        const result = await asyncFn(...args);
        setData(result);
        return result;
      } catch (e) {
        setError(e);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [asyncFn]
  );

  return { execute, loading, error, data, setData };
}


