'use client';

import React, { useState } from 'react';
import { 
  ArrowUturnLeftIcon, 
  ArrowUturnRightIcon,
  MagnifyingGlassPlusIcon,
  MagnifyingGlassMinusIcon,
  DocumentArrowDownIcon,
  Squares2X2Icon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import { useCanvasStore } from '../../store/canvasStore';
import { ExportModal } from './ExportModal';
import { CanvasSizeSelector } from './CanvasSizeSelector';
import { ExportOptions } from '../../types/canvas';

export const Toolbar: React.FC = () => {
  const [showExportModal, setShowExportModal] = useState(false);
  
  const { 
    undo, 
    redo, 
    zoom, 
    setZoom, 
    grid, 
    toggleGrid, 
    guides,
    toggleGuides,
    rulers,
    toggleRulers,
    history 
  } = useCanvasStore();

  const canUndo = history.past.length > 0;
  const canRedo = history.future.length > 0;

  const handleZoomIn = () => {
    setZoom(zoom * 1.2);
  };

  const handleZoomOut = () => {
    setZoom(zoom / 1.2);
  };

  const handleZoomReset = () => {
    setZoom(1);
  };

  const handleExport = () => {
    setShowExportModal(true);
  };

  const handleExportConfirm = (options: ExportOptions) => {
    // TODO: Get reference to the canvas stage and call exporter
    console.log('Export with options:', options);
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
      {/* Left Section - History */}
      <div className="flex items-center space-x-2">
        <button
          onClick={undo}
          disabled={!canUndo}
          className={`p-2 rounded hover:bg-gray-100 ${
            !canUndo ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700'
          }`}
          title="Undo (Ctrl+Z)"
        >
          <ArrowUturnLeftIcon className="w-5 h-5" />
        </button>
        
        <button
          onClick={redo}
          disabled={!canRedo}
          className={`p-2 rounded hover:bg-gray-100 ${
            !canRedo ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700'
          }`}
          title="Redo (Ctrl+Y)"
        >
          <ArrowUturnRightIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Center Section - Canvas Size & Zoom Controls */}
      <div className="flex items-center space-x-4">
        <CanvasSizeSelector />
        
        <div className="flex items-center space-x-2">
          <button
            onClick={handleZoomOut}
            className="p-2 rounded hover:bg-gray-100 text-gray-700"
            title="Zoom Out"
          >
            <MagnifyingGlassMinusIcon className="w-5 h-5" />
          </button>
          
          <button
            onClick={handleZoomReset}
            className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200 min-w-[60px]"
            title="Reset Zoom"
          >
            {Math.round(zoom * 100)}%
          </button>
          
          <button
            onClick={handleZoomIn}
            className="p-2 rounded hover:bg-gray-100 text-gray-700"
            title="Zoom In"
          >
            <MagnifyingGlassPlusIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Right Section - View Options & Export */}
      <div className="flex items-center space-x-2">
        <button
          onClick={toggleGrid}
          className={`p-2 rounded hover:bg-gray-100 ${
            grid.enabled ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
          }`}
          title="Toggle Grid"
        >
          <Squares2X2Icon className="w-5 h-5" />
        </button>
        
        <button
          onClick={toggleRulers}
          className={`p-2 rounded hover:bg-gray-100 ${
            rulers.enabled ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
          }`}
          title="Toggle Rulers"
        >
          <Squares2X2Icon className="w-5 h-5" />
        </button>
        
        <button
          onClick={toggleGuides}
          className={`p-2 rounded hover:bg-gray-100 ${
            guides.enabled ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
          }`}
          title="Toggle Guides"
        >
          {guides.enabled ? (
            <EyeIcon className="w-5 h-5" />
          ) : (
            <EyeSlashIcon className="w-5 h-5" />
          )}
        </button>

        <div className="w-px h-6 bg-gray-300 mx-2" />
        
        <button
          onClick={handleExport}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center space-x-2"
          title="Export"
        >
          <DocumentArrowDownIcon className="w-4 h-4" />
          <span>Export</span>
        </button>
      </div>

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExportConfirm}
      />
    </div>
  );
};