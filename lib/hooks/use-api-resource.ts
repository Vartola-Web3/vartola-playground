'use client';

import { useCallback, useEffect, useState } from 'react';

type Result<T> = { key: string; data?: T; error?: string };

// Loads JSON from an API route without calling setState synchronously inside an effect.
// State is only written after the request settles. Passing null as the url skips the request.
// While a reload is running the previous data stays visible (loading is true), so lists do not flash empty.
export function useApiResource<T>(url: string | null) {
  const [version, setVersion] = useState(0);
  const [result, setResult] = useState<Result<T> | null>(null);
  const key = url === null ? null : `${url}#${version}`;

  useEffect(() => {
    if (url === null || key === null) return undefined;
    let alive = true;
    fetch(url)
      .then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error((body as { error?: string }).error || `Request failed (${response.status})`);
        return body as T;
      })
      .then((data) => {
        if (alive) setResult({ key, data });
      })
      .catch((reason: unknown) => {
        if (alive) setResult({ key, error: reason instanceof Error ? reason.message : 'Request failed' });
      });
    return () => {
      alive = false;
    };
  }, [url, key]);

  const reload = useCallback(() => setVersion((value) => value + 1), []);
  const settled = key !== null && result?.key === key;
  return {
    data: result?.data,
    error: settled ? result?.error : undefined,
    loading: key !== null && !settled,
    reload,
  };
}
