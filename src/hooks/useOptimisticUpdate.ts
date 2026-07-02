import { useState, useCallback } from 'react';

export const useOptimisticUpdate = <T,>(initialData: T[]) => {
  const [data, setData] = useState<T[]>(initialData);
  const [optimisticUpdates, setOptimisticUpdates] = useState<Map<string, T>>(new Map());

  const addOptimistic = useCallback((id: string, item: T) => {
    setOptimisticUpdates((prev) => new Map(prev).set(id, item));
    setData((prev) => [item, ...prev]);
  }, []);

  const removeOptimistic = useCallback((id: string) => {
    setOptimisticUpdates((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const updateOptimistic = useCallback((id: string, updates: Partial<T>) => {
    setData((prev) =>
      prev.map((item) => {
        if ((item as any).id === id) {
          return { ...item, ...updates };
        }
        return item;
      })
    );
  }, []);

  const confirmOptimistic = useCallback((id: string, confirmedItem: T) => {
    removeOptimistic(id);
    setData((prev) =>
      prev.map((item) => ((item as any).id === id ? confirmedItem : item))
    );
  }, [removeOptimistic]);

  const rollbackOptimistic = useCallback((id: string) => {
    removeOptimistic(id);
    setData((prev) => prev.filter((item) => (item as any).id !== id));
  }, [removeOptimistic]);

  return {
    data,
    setData,
    addOptimistic,
    updateOptimistic,
    confirmOptimistic,
    rollbackOptimistic,
  };
};
