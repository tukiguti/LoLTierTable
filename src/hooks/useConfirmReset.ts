import { useCallback } from 'react';

export interface UseConfirmResetOptions {
  message: string;
  onConfirm: () => void;
}

export const useConfirmReset = ({ message, onConfirm }: UseConfirmResetOptions) => {
  const handleReset = useCallback(() => {
    if (window.confirm(message)) {
      onConfirm();
    }
  }, [message, onConfirm]);

  return { handleReset };
};