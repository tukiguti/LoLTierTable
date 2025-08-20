import React from 'react';

interface ResizerProps {
  direction: 'horizontal' | 'vertical';
  onMouseDown: (e: React.MouseEvent) => void;
  isResizing: boolean;
  onReset?: () => void;
  showResetButton?: boolean;
}

export const Resizer: React.FC<ResizerProps> = ({
  direction,
  onMouseDown,
  isResizing,
  onReset,
  showResetButton = false
}) => {
  const isHorizontal = direction === 'horizontal';
  
  const baseClasses = `
    ${isHorizontal 
      ? 'w-1 h-full cursor-col-resize flex-shrink-0' 
      : 'h-1 w-full cursor-row-resize flex-shrink-0'
    }
    ${isResizing ? 'bg-blue-500' : 'bg-gray-300 hover:bg-gray-400'}
    transition-colors duration-150 relative group
  `;

  return (
    <div
      className={baseClasses}
      onMouseDown={onMouseDown}
    >
      {/* Visual indicator */}
      <div className={`
        absolute inset-0 
        ${isHorizontal ? 'border-l-2' : 'border-t-2'} 
        ${isResizing ? 'border-blue-500' : 'border-transparent group-hover:border-gray-400'}
        transition-colors duration-150
      `} />
      
      {/* Hover area for easier interaction */}
      <div className={`
        absolute 
        ${isHorizontal 
          ? 'w-2 h-full -left-1 top-0' 
          : 'h-2 w-full left-0 -top-1'
        }
        ${isHorizontal ? 'cursor-col-resize' : 'cursor-row-resize'}
      `} />

      {/* Reset button */}
      {showResetButton && onReset && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onReset();
          }}
          className={`
            absolute z-10 w-6 h-6 bg-gray-600 hover:bg-gray-700 text-white rounded-full
            flex items-center justify-center text-xs font-bold
            opacity-0 group-hover:opacity-100 transition-opacity
            ${isHorizontal 
              ? 'top-1/2 -translate-y-1/2 -left-3' 
              : 'left-1/2 -translate-x-1/2 -top-3'
            }
          `}
          title="リセット"
        >
          ↺
        </button>
      )}
    </div>
  );
};