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
import { useCanvasStore } from '../../store/canvas-store';
import { ExportModal } from './export-modal';
import { CanvasSizeSelector } from './canvas-size-selector';
import { ExportOptions } from '../../types/canvas';
import { Button } from './button';
import { Slider } from './slider';

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
        <Button
          onClick={undo}
          disabled={!canUndo}
          variant="ghost"
          size="sm"
          title="Undo (Ctrl+Z)"
        >
          <ArrowUturnLeftIcon className="w-5 h-5" />
        </Button>
        
        <Button
          onClick={redo}
          disabled={!canRedo}
          variant="ghost"
          size="sm"
          title="Redo (Ctrl+Y)"
        >
          <ArrowUturnRightIcon className="w-5 h-5" />
        </Button>
      </div>

      {/* Center Section - Canvas Size & Zoom Controls */}
      <div className="flex items-center space-x-4">
        <CanvasSizeSelector />
        
        <div className="flex items-center space-x-2">
          <Button
            onClick={handleZoomOut}
            variant="ghost"
            size="sm"
            title="Zoom Out"
          >
            <MagnifyingGlassMinusIcon className="w-5 h-5" />
          </Button>
          
          <Button
            onClick={handleZoomReset}
            variant="outline"
            size="sm"
            className="min-w-[60px]"
            title="Reset Zoom"
          >
            {Math.round(zoom * 100)}%
          </Button>
          
          <Button
            onClick={handleZoomIn}
            variant="ghost"
            size="sm"
            title="Zoom In"
          >
            <MagnifyingGlassPlusIcon className="w-5 h-5" />
          </Button>
        </div>

        {/* Zoom Slider */}
        <div className="flex items-center space-x-2 min-w-[120px]">
          <span className="text-xs text-gray-500">Zoom:</span>
          <Slider
            value={[zoom * 100]}
            onValueChange={(value) => setZoom(value[0] / 100)}
            min={10}
            max={500}
            step={10}
            className="w-20"
          />
          <span className="text-xs text-gray-500 w-8">{Math.round(zoom * 100)}%</span>
        </div>
      </div>

      {/* Right Section - View Options & Export */}
      <div className="flex items-center space-x-2">
        <Button
          onClick={toggleGrid}
          variant={grid.enabled ? "default" : "ghost"}
          size="sm"
          title="Toggle Grid"
        >
          <Squares2X2Icon className="w-5 h-5" />
        </Button>
        
        <Button
          onClick={toggleRulers}
          variant={rulers.enabled ? "default" : "ghost"}
          size="sm"
          title="Toggle Rulers"
        >
          <Squares2X2Icon className="w-5 h-5" />
        </Button>
        
        <Button
          onClick={toggleGuides}
          variant={guides.enabled ? "default" : "ghost"}
          size="sm"
          title="Toggle Guides"
        >
          {guides.enabled ? (
            <EyeIcon className="w-5 h-5" />
          ) : (
            <EyeSlashIcon className="w-5 h-5" />
          )}
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-2" />
        
        <Button
          onClick={handleExport}
          title="Export"
        >
          <DocumentArrowDownIcon className="w-4 h-4" />
          Export
        </Button>
      </div>

      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExportConfirm}
      />
    </div>
  );
};