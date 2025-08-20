import { useState, useCallback, useEffect, useRef } from 'react';

interface UseVerticalResizableOptions {
  defaultSize: number;
  minSize?: number;
  maxSize?: number;
  storageKey?: string;
}

interface UseVerticalResizableReturn {
  size: number;
  isResizing: boolean;
  handleMouseDown: (e: React.MouseEvent) => void;
  resetSize: () => void;
}

export const useVerticalResizable = ({
  defaultSize,
  minSize = 200,
  maxSize = 600,
  storageKey
}: UseVerticalResizableOptions): UseVerticalResizableReturn => {
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

    // 垂直リサイズは上向きの動きでサイズが減る
    const delta = startPosRef.current - e.clientY;
    const newSize = Math.max(minSize, Math.min(maxSize, startSizeRef.current + delta));
    setSize(newSize);
  }, [isResizing, minSize, maxSize]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    startPosRef.current = e.clientY;
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
      document.body.style.cursor = 'row-resize';
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