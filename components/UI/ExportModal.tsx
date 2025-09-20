'use client';

import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ExportOptions } from '../../types/canvas';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './dialog';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';
import { Checkbox } from './checkbox';

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Export Canvas</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Format Selection */}
          <div>
            <Label htmlFor="format">Format</Label>
            <Select
              value={options.format}
              onValueChange={(value) => setOptions({ ...options, format: value as 'png' | 'jpg' | 'pdf' | 'svg' })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="png">PNG</SelectItem>
                <SelectItem value="jpg">JPG</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="svg">SVG</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quality */}
          {(options.format === 'png' || options.format === 'jpg') && (
            <div>
              <Label>Quality: {Math.round(options.quality * 100)}%</Label>
              <Input
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
            <Label>Scale: {options.scale}x</Label>
            <Input
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
            <div className="flex items-center space-x-2">
              <Checkbox
                id="transparent"
                checked={options.transparentBackground}
                onCheckedChange={(checked) => setOptions({ ...options, transparentBackground: checked as boolean })}
              />
              <Label htmlFor="transparent">Transparent background</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="selected-only"
                checked={options.selectedOnly}
                onCheckedChange={(checked) => setOptions({ ...options, selectedOnly: checked as boolean })}
              />
              <Label htmlFor="selected-only">Selected elements only</Label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <Button
              onClick={onClose}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={handleExport}
            >
              Export
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};