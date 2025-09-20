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
  EyeSlashIcon,
  RectangleStackIcon,
  ArrowRightCircleIcon,
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
    history,
    selectedIds,
    groupElements,
    ungroupElements,
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
    <div className="bg-white border-b border-gray-200 px-5 py-2.5 flex items-center justify-between shadow-sm">
      {/* Left Section - History & Groups */}
      <div className="flex items-center space-x-1.5">
        <Button
          onClick={undo}
          disabled={!canUndo}
          variant="ghost"
          size="sm"
          title="Undo (Ctrl+Z)"
          className="hover:bg-gray-100"
        >
          <ArrowUturnLeftIcon className="w-5 h-5" />
        </Button>

        <Button
          onClick={redo}
          disabled={!canRedo}
          variant="ghost"
          size="sm"
          title="Redo (Ctrl+Y)"
          className="hover:bg-gray-100"
        >
          <ArrowUturnRightIcon className="w-5 h-5" />
        </Button>

        <div className="w-px h-7 bg-gray-300 mx-2.5" />

        <Button
          onClick={() => groupElements(selectedIds)}
          disabled={selectedIds.length < 2}
          variant="ghost"
          size="sm"
          title="Group Elements (Ctrl+G)"
          className="hover:bg-gray-100"
        >
          <RectangleStackIcon className="w-5 h-5" />
        </Button>

        <Button
          onClick={() => {
            // Find groups in selection and ungroup them
            const { elements } = useCanvasStore.getState();
            const groupIds = selectedIds.filter((id) => {
              const element = elements.find((el) => el.id === id);
              return element?.type === 'group';
            });
            groupIds.forEach((id) => ungroupElements(id));
          }}
          disabled={selectedIds.length === 0}
          variant="ghost"
          size="sm"
          title="Ungroup Elements (Ctrl+Shift+G)"
          className="hover:bg-gray-100"
        >
          <ArrowRightCircleIcon className="w-5 h-5" />
        </Button>
      </div>

      {/* Center Section - Canvas Size & Zoom Controls */}
      <div className="flex items-center space-x-5">
        <div className="flex items-center space-x-2.5">
          <CanvasSizeSelector />
        </div>

        <div className="flex items-center space-x-1 border-l border-gray-200 pl-5">
          <Button
            onClick={handleZoomOut}
            variant="ghost"
            size="sm"
            title="Zoom Out"
            className="hover:bg-gray-100"
          >
            <MagnifyingGlassMinusIcon className="w-5 h-5" />
          </Button>

          <Button
            onClick={handleZoomReset}
            variant="outline"
            size="sm"
            className="min-w-[65px] mx-1"
            title="Reset Zoom"
          >
            {Math.round(zoom * 100)}%
          </Button>

          <Button
            onClick={handleZoomIn}
            variant="ghost"
            size="sm"
            title="Zoom In"
            className="hover:bg-gray-100"
          >
            <MagnifyingGlassPlusIcon className="w-5 h-5" />
          </Button>
        </div>

        {/* Zoom Slider */}
        <div className="flex items-center space-x-2.5 border-l border-gray-200 pl-5 min-w-[130px]">
          <span className="text-sm text-gray-600 font-medium">Zoom:</span>
          <Slider
            value={[zoom * 100]}
            onValueChange={(value) => setZoom(value[0] / 100)}
            min={10}
            max={500}
            step={10}
            className="w-20"
          />
          <span className="text-sm text-gray-600 font-medium w-8">
            {Math.round(zoom * 100)}%
          </span>
        </div>
      </div>

      {/* Right Section - View Options & Export */}
      <div className="flex items-center space-x-1">
        <Button
          onClick={toggleGrid}
          variant={grid.enabled ? 'default' : 'ghost'}
          size="sm"
          title="Toggle Grid"
          className="hover:bg-gray-100"
        >
          <Squares2X2Icon className="w-5 h-5" />
        </Button>

        <Button
          onClick={toggleRulers}
          variant={rulers.enabled ? 'default' : 'ghost'}
          size="sm"
          title="Toggle Rulers"
          className="hover:bg-gray-100"
        >
          <Squares2X2Icon className="w-5 h-5" />
        </Button>

        <Button
          onClick={toggleGuides}
          variant={guides.enabled ? 'default' : 'ghost'}
          size="sm"
          title="Toggle Guides"
          className="hover:bg-gray-100"
        >
          {guides.enabled ? (
            <EyeIcon className="w-5 h-5" />
          ) : (
            <EyeSlashIcon className="w-5 h-5" />
          )}
        </Button>

        <div className="w-px h-7 bg-gray-300 mx-2.5" />

        <Button onClick={handleExport} title="Export" className="ml-1.5">
          <DocumentArrowDownIcon className="w-4 h-4 mr-1.5" />
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
