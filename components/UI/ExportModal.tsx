'use client';

import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ExportOptions } from '../../types/canvas';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (options: ExportOptions) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  onExport,
}) => {
  const [options, setOptions] = useState<ExportOptions>({
    format: 'png',
    quality: 1,
    scale: 1,
    transparentBackground: false,
    selectedOnly: false,
  });

  const handleExport = () => {
    onExport(options);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-96 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Export Canvas</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Format
            </label>
            <select
              value={options.format}
              onChange={(e) => setOptions({ ...options, format: e.target.value as 'png' | 'jpg' | 'pdf' | 'svg' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="png">PNG</option>
              <option value="jpg">JPG</option>
              <option value="pdf">PDF</option>
              <option value="svg">SVG</option>
            </select>
          </div>

          {/* Quality */}
          {(options.format === 'png' || options.format === 'jpg') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quality: {Math.round(options.quality * 100)}%
              </label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={options.quality}
                onChange={(e) => setOptions({ ...options, quality: parseFloat(e.target.value) })}
                className="w-full"
              />
            </div>
          )}

          {/* Scale */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Scale: {options.scale}x
            </label>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.5"
              value={options.scale}
              onChange={(e) => setOptions({ ...options, scale: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>

          {/* Options */}
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.transparentBackground}
                onChange={(e) => setOptions({ ...options, transparentBackground: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Transparent background</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={options.selectedOnly}
                onChange={(e) => setOptions({ ...options, selectedOnly: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Selected elements only</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Export
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};