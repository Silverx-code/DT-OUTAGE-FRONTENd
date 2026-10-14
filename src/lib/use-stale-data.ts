"use client";

import { useEffect } from "react";
import { readApiCache } from "./api";

/** Hydrate already-fetched page data immediately; the page then refreshes it in the background. */
export function useStaleData<T>(path: string, setData: (data: T) => void) {
  useEffect(() => {
    const cached = readApiCache<T>(path);
    if (cached !== null) setData(cached);
  }, [path, setData]);
}
