import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface UsePaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  total?: number;
  resetDeps?: ReadonlyArray<unknown>;
}

function toPositiveInt(value: number, fallback = 1): number {
  if (!Number.isFinite(value)) {
    return fallback;
  }

  return Math.max(1, Math.floor(value));
}

function toNonNegativeInt(value: number, fallback = 0): number {
  if (!Number.isFinite(value)) {
    return fallback;
  }

  return Math.max(0, Math.floor(value));
}

function areDepsEqual(current: ReadonlyArray<unknown>, previous: ReadonlyArray<unknown>) {
  if (current.length !== previous.length) {
    return false;
  }

  for (let index = 0; index < current.length; index += 1) {
    if (!Object.is(current[index], previous[index])) {
      return false;
    }
  }

  return true;
}

export function usePagination({
  initialPage = 1,
  initialPageSize = 20,
  total = 0,
  resetDeps = [],
}: UsePaginationOptions = {}) {
  const safeInitialPage = toPositiveInt(initialPage, 1);
  const safeInitialPageSize = toPositiveInt(initialPageSize, 20);
  const safeTotal = toNonNegativeInt(total, 0);

  const [page, setPageState] = useState(safeInitialPage);
  const [pageSize, setPageSizeState] = useState(safeInitialPageSize);
  const [totalItems, setTotalItems] = useState(safeTotal);
  const previousResetDeps = useRef(resetDeps);

  useEffect(() => {
    setTotalItems(safeTotal);
  }, [safeTotal]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(totalItems / pageSize)),
    [totalItems, pageSize]
  );

  useEffect(() => {
    setPageState((currentPage) => Math.min(Math.max(1, currentPage), totalPages));
  }, [totalPages]);

  useEffect(() => {
    if (!areDepsEqual(resetDeps, previousResetDeps.current)) {
      previousResetDeps.current = resetDeps;
      setPageState(1);
    }
  }, [resetDeps]);

  const pageIndex = page - 1;

  const setPage = useCallback(
    (nextPage: number) => {
      setPageState(Math.min(Math.max(1, toPositiveInt(nextPage, 1)), totalPages));
    },
    [totalPages]
  );

  const setPageSize = useCallback((nextPageSize: number) => {
    setPageSizeState(toPositiveInt(nextPageSize, 1));
    setPageState(1);
  }, []);

  const setTotal = useCallback((nextTotal: number) => {
    setTotalItems(toNonNegativeInt(nextTotal, 0));
  }, []);

  const reset = useCallback(() => {
    setPageState(1);
    setPageSizeState(safeInitialPageSize);
  }, [safeInitialPageSize]);

  return {
    page,
    pageIndex,
    pageSize,
    total: totalItems,
    totalPages,
    setPage,
    setPageSize,
    setTotal,
    reset,
  };
}
