"use client";

import { useEffect, useState } from "react";

import { api } from "@/lib/api";

/** POST `payload` to `path` whenever it changes (debounced), cancelling stale requests. */
export function useDebouncedApi<T>(
  path: string,
  payload: unknown,
  delayMs = 300,
) {
  const key = JSON.stringify(payload);
  const [state, setState] = useState<{
    data: T | null;
    error: string | null;
    key: string | null;
  }>({
    data: null,
    error: null,
    key: null,
  });

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      api<T>(path, {
        method: "POST",
        body: key,
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
      })
        .then((data) => setState({ data, error: null, key }))
        .catch((e: unknown) => {
          if (!controller.signal.aborted) {
            setState({
              data: null,
              error: e instanceof Error ? e.message : String(e),
              key,
            });
          }
        });
    }, delayMs);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [path, key, delayMs]);

  return { ...state, isStale: state.key !== key };
}
