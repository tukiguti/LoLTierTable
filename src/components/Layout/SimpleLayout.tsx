import React, { type ReactNode } from 'react';

interface SimpleLayoutProps {
  workArea: ReactNode;
  championPanel: ReactNode;
}

export const SimpleLayout: React.FC<SimpleLayoutProps> = ({
  workArea,
  championPanel,
}) => {
  return (
    <div 
      className="h-full flex flex-col"
      style={{
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        minHeight: '100vh'
      }}
    >
      {/* Full Screen Layout */}
      <div 
        className="flex-1 overflow-hidden"
        style={{ 
          background: 'linear-gradient(135deg, #16213e 0%, #1a1a2e 100%)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          margin: '8px'
        }}
      >
        <div className="h-full flex flex-col">
          {/* Work Area - 70% */}
          <div className="overflow-hidden" style={{ height: '70%' }}>
            {workArea}
          </div>
          
          {/* Champion Panel - 30% */}
          <div 
            className="overflow-hidden"
            style={{ 
              height: '30%',
              borderTop: '2px solid rgba(59, 130, 246, 0.3)'
            }}
          >
            {championPanel}
          </div>
        </div>
      </div>
    </div>
  );
};