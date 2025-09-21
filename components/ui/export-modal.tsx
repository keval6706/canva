'use client';

import React, { useState } from 'react';
import { ExportOptions } from '../../types/canvas';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { Button } from './button';
import { Label } from './label';
import { Slider } from './slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';

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
  });

  const handleExport = () => {
    onExport(options);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] p-6">
        <DialogHeader className="mb-6">
          <DialogTitle>Export Canvas</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Format Selection */}
          <div className="space-y-4">
            <Label htmlFor="format">Format</Label>
            <Select
              value={options.format}
              onValueChange={(value) =>
                setOptions({
                  ...options,
                  format: value as 'png' | 'jpg' | 'pdf',
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="png">PNG</SelectItem>
                <SelectItem value="jpg">JPG</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quality */}
          {(options.format === 'png' || options.format === 'jpg') && (
            <div className="space-y-4">
              <Label>Quality: {Math.round(options.quality * 100)}%</Label>
              <Slider
                value={[options.quality]}
                onValueChange={(value) =>
                  setOptions({ ...options, quality: value[0] })
                }
                min={0.1}
                max={1}
                step={0.1}
                className="w-full"
              />
            </div>
          )}

          {/* Scale */}
          <div className="space-y-4">
            <Label>Scale: {options.scale}x</Label>
            <Slider
              value={[options.scale]}
              onValueChange={(value) =>
                setOptions({ ...options, scale: value[0] })
              }
              min={0.5}
              max={3}
              step={0.5}
              className="w-full"
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-4 pt-8 mt-4">
            <Button onClick={onClose} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleExport}>Export</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
