import { useState, useCallback, useEffect, useRef } from 'react';

interface UseResizableOptions {
  defaultSize: number;
  minSize?: number;
  maxSize?: number;
  storageKey?: string;
}

interface UseResizableReturn {
  size: number;
  isResizing: boolean;
  handleMouseDown: (e: React.MouseEvent) => void;
  resetSize: () => void;
}

export const useResizable = ({
  defaultSize,
  minSize = 200,
  maxSize = 800,
  storageKey
}: UseResizableOptions): UseResizableReturn => {
  // ローカルストレージから初期値を復元
  const getInitialSize = () => {
    if (storageKey) {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsedSize = parseInt(saved, 10);
        if (!isNaN(parsedSize) && parsedSize >= minSize && parsedSize <= maxSize) {
          return parsedSize;
        }
      }
    }
    return defaultSize;
  };

  const [size, setSize] = useState(getInitialSize);
  const [isResizing, setIsResizing] = useState(false);
  const startPosRef = useRef(0);
  const startSizeRef = useRef(0);

  // サイズをローカルストレージに保存
  useEffect(() => {
    if (storageKey) {
      localStorage.setItem(storageKey, size.toString());
    }
  }, [size, storageKey]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;

    const delta = e.clientX - startPosRef.current;
    const newSize = Math.max(minSize, Math.min(maxSize, startSizeRef.current + delta));
    setSize(newSize);
  }, [isResizing, minSize, maxSize]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    startPosRef.current = e.clientX;
    startSizeRef.current = size;
  }, [size]);

  const resetSize = useCallback(() => {
    setSize(defaultSize);
  }, [defaultSize]);

  // グローバルイベントリスナーの設定
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  return {
    size,
    isResizing,
    handleMouseDown,
    resetSize
  };
};