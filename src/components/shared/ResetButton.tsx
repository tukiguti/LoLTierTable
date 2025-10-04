import React from 'react';
import { useConfirmReset } from '../../hooks/useConfirmReset';

export interface ResetButtonProps {
  onReset: () => void;
  confirmMessage: string;
  className?: string;
  children?: React.ReactNode;
}

export const ResetButton: React.FC<ResetButtonProps> = ({
  onReset,
  confirmMessage,
  className = '',
  children = 'リセット',
}) => {
  const { handleReset } = useConfirmReset({
    message: confirmMessage,
    onConfirm: onReset,
  });

  return (
    <button
      type="button"
      onClick={handleReset}
      className={`px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700 transition-colors text-sm font-medium ${className}`}
    >
      {children}
    </button>
  );
};
