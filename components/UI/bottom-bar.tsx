'use client';

import React from 'react';
import { useCanvasStore } from '../../store/canvas-store';

export const BottomBar: React.FC = () => {
  const { width, height, zoom, selectedIds, elements } = useCanvasStore();

  return (
    <div className="bg-white border-t border-gray-200 px-6 py-3 flex items-center justify-between text-sm shadow-sm">
      {/* Left side - Canvas info */}
      <div className="flex items-center space-x-8">
        <div className="flex items-center space-x-2">
          <span className="text-gray-500">Canvas:</span>
          <span className="font-medium text-gray-900">{width} × {height}px</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-gray-500">Zoom:</span>
          <span className="font-medium text-gray-900">{Math.round(zoom * 100)}%</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-gray-500">Elements:</span>
          <span className="font-medium text-gray-900">{elements.length}</span>
        </div>
      </div>
      
      {/* Right side - Selection info */}
      <div className="flex items-center space-x-6">
        {selectedIds.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-gray-500">Selected:</span>
            <span className="font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full text-xs">
              {selectedIds.length} element{selectedIds.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
        
        <div className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
          Canva-like Editor
        </div>
      </div>
    </div>
  );
};