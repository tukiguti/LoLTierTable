import React from 'react';
import { useMatrixStore } from '../../store/matrixStore';
import { MatrixGrid } from './MatrixGrid';
import { ZoneScatterGrid } from './ZoneScatterGrid';
import { MatrixControls } from './MatrixControls';
import { DroppableZone } from '../DragDrop/DroppableZone';

interface MatrixProps {
  onSave?: () => void;
  onExport?: () => void;
}

export const Matrix: React.FC<MatrixProps> = ({ onSave, onExport }) => {
  const {
    champions,
    xAxisLabel,
    yAxisLabel,
    topLabel,
    bottomLabel,
    leftLabel,
    rightLabel,
    gridSize,
    matrixType,
    quadrantLabels,
    updateTopLabel,
    updateBottomLabel,
    updateLeftLabel,
    updateRightLabel,
    updateGridSize,
    setMatrixType,
    updateQuadrantLabel,
    resetMatrix,
  } = useMatrixStore();

  const handleReset = () => {
    if (champions.length === 0 || window.confirm('マトリクスをリセットしますか？すべてのチャンピオンが削除されます。')) {
      resetMatrix();
    }
  };

  const handleSave = () => {
    if (onSave) {
      onSave();
    } else {
      console.log('Saving matrix...', { champions, xAxisLabel, yAxisLabel, gridSize });
    }
  };

  const handleExport = () => {
    if (onExport) {
      onExport();
    } else {
      console.log('Exporting matrix as image...');
    }
  };

  return (
    <div className="space-y-4">
      <MatrixControls
        topLabel={topLabel}
        bottomLabel={bottomLabel}
        leftLabel={leftLabel}
        rightLabel={rightLabel}
        gridSize={gridSize}
        matrixType={matrixType}
        quadrantLabels={quadrantLabels}
        onTopLabelChange={updateTopLabel}
        onBottomLabelChange={updateBottomLabel}
        onLeftLabelChange={updateLeftLabel}
        onRightLabelChange={updateRightLabel}
        onGridSizeChange={updateGridSize}
        onMatrixTypeChange={setMatrixType}
        onQuadrantLabelChange={updateQuadrantLabel}
        onReset={handleReset}
        onSave={onSave ? handleSave : undefined}
        onExport={onExport ? handleExport : undefined}
      />

      <div className="flex justify-center">
        {matrixType === 'grid' ? (
          <MatrixGrid
            champions={champions}
            gridSize={gridSize}
            topLabel={topLabel}
            bottomLabel={bottomLabel}
            leftLabel={leftLabel}
            rightLabel={rightLabel}
          />
        ) : (
          <ZoneScatterGrid
            champions={champions}
            topLabel={topLabel}
            bottomLabel={bottomLabel}
            leftLabel={leftLabel}
            rightLabel={rightLabel}
            zoneLabels={quadrantLabels}
            zoneSize={Math.floor(gridSize.width / 2)} // Use half of grid width for zone size
            cellSize={45}
          />
        )}
      </div>

      {/* Trash Bin */}
      <div className="mt-4 flex justify-center">
        <DroppableZone
          id="trash"
          data={{ type: 'trash' }}
          className="w-16 h-16 bg-red-100 border-2 border-red-300 border-dashed rounded-lg flex items-center justify-center text-red-500 hover:bg-red-200 transition-colors"
          activeClassName="bg-red-200 border-red-500"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H9a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </DroppableZone>
      </div>

      {/* Champion Count Info */}
      <div className="text-center text-sm text-gray-500">
        配置済みチャンピオン: {champions.length} / {gridSize.width * gridSize.height}
      </div>
    </div>
  );
};