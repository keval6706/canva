'use client';

import React from 'react';
import { useCanvasStore } from '../../store/canvas-store';

export const BottomBar: React.FC = () => {
  const { width, height, zoom, selectedIds, elements } = useCanvasStore();

  return (
    <div className="bg-white border-t border-gray-200 px-4 py-2 flex items-center justify-between text-sm text-gray-600">
      {/* Left side - Canvas info */}
      <div className="flex items-center space-x-6">
        <div>
          Canvas: {width} × {height}px
        </div>
        <div>
          Zoom: {Math.round(zoom * 100)}%
        </div>
        <div>
          Elements: {elements.length}
        </div>
      </div>
      
      {/* Right side - Selection info */}
      <div className="flex items-center space-x-4">
        {selectedIds.length > 0 && (
          <div>
            Selected: {selectedIds.length} element{selectedIds.length !== 1 ? 's' : ''}
          </div>
        )}
        
        <div className="text-xs text-gray-400">
          Polotno-like Canvas Editor
        </div>
      </div>
    </div>
  );
};