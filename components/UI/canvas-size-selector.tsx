'use client';

import React, { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { useCanvasStore } from '../../store/canvas-store';
import { Button } from './button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog';
import { Input } from './input';
import { Label } from './label';
import { useForm } from '@tanstack/react-form';
import { z } from 'zod';

// Zod schema for custom size validation
const customSizeSchema = z.object({
  width: z
    .number({ message: 'Width must be a valid number' })
    .min(1, 'Width must be at least 1 pixel')
    .max(10000, 'Width cannot exceed 10,000 pixels'),
  height: z
    .number({ message: 'Height must be a valid number' })
    .min(1, 'Height must be at least 1 pixel')
    .max(10000, 'Height cannot exceed 10,000 pixels'),
});

interface CanvasSize {
  name: string;
  width: number;
  height: number;
  category: string;
}

const CANVAS_SIZES: CanvasSize[] = [
  // Print sizes
  { name: 'A4', width: 595, height: 842, category: 'Print' },
  { name: 'A3', width: 842, height: 1191, category: 'Print' },
  { name: 'Letter', width: 612, height: 792, category: 'Print' },
  { name: 'Legal', width: 612, height: 1008, category: 'Print' },

  // Social Media
  {
    name: 'Instagram Post',
    width: 1080,
    height: 1080,
    category: 'Social Media',
  },
  {
    name: 'Instagram Story',
    width: 1080,
    height: 1920,
    category: 'Social Media',
  },
  { name: 'Facebook Post', width: 1200, height: 630, category: 'Social Media' },
  { name: 'Twitter Post', width: 1200, height: 675, category: 'Social Media' },
  { name: 'LinkedIn Post', width: 1200, height: 627, category: 'Social Media' },

  // Web & Digital
  { name: 'Web Banner', width: 1200, height: 300, category: 'Web' },
  { name: 'Blog Header', width: 1200, height: 400, category: 'Web' },
  { name: 'Presentation', width: 1024, height: 768, category: 'Web' },

  // Custom sizes
  { name: 'HD (1920x1080)', width: 1920, height: 1080, category: 'Video' },
  { name: '4K (3840x2160)', width: 3840, height: 2160, category: 'Video' },
];

interface CanvasSizeSelectorProps {
  className?: string;
}

export const CanvasSizeSelector: React.FC<CanvasSizeSelectorProps> = ({
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isCustomDialogOpen, setIsCustomDialogOpen] = useState(false);
  const { width, height, setCanvasSize } = useCanvasStore();

  // Initialize form with current canvas size
  const form = useForm({
    defaultValues: {
      width: width,
      height: height,
    },
    onSubmit: async ({ value }) => {
      setCanvasSize(value.width, value.height);
      setIsCustomDialogOpen(false);
      setIsOpen(false);
    },
    validators: {
      onChange: customSizeSchema,
    },
  });

  const currentSize = CANVAS_SIZES.find(
    (size) => size.width === width && size.height === height
  );
  const currentSizeLabel = currentSize
    ? currentSize.name
    : `${width} × ${height}`;

  const handleSizeSelect = (size: CanvasSize) => {
    setCanvasSize(size.width, size.height);
    setIsOpen(false);
  };

  const handleCustomSizeOpen = () => {
    form.reset({
      width: width,
      height: height,
    });
    setIsCustomDialogOpen(true);
  };

  const groupedSizes = CANVAS_SIZES.reduce((acc, size) => {
    if (!acc[size.category]) {
      acc[size.category] = [];
    }
    acc[size.category].push(size);
    return acc;
  }, {} as Record<string, CanvasSize[]>);

  return (
    <div className={`relative ${className}`}>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className="flex items-center space-x-2"
      >
        <span className="text-sm font-medium">{currentSizeLabel}</span>
        <ChevronDownIcon className="w-4 h-4" />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute top-full mt-1 w-64 bg-white border border-gray-300 rounded-md shadow-lg z-20 max-h-96 overflow-y-auto">
            {Object.entries(groupedSizes).map(([category, sizes]) => (
              <div key={category}>
                <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {category}
                  </span>
                </div>
                {sizes.map((size) => (
                  <button
                    key={size.name}
                    onClick={() => handleSizeSelect(size)}
                    className={`w-full text-left px-3 py-2 hover:bg-gray-50 focus:outline-none focus:bg-gray-50 ${
                      currentSize?.name === size.name
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{size.name}</span>
                      <span className="text-xs text-gray-500">
                        {size.width} × {size.height}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ))}

            {/* Custom size option */}
            <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Custom
              </span>
            </div>
            <button
              onClick={handleCustomSizeOpen}
              className="w-full text-left px-3 py-2 hover:bg-gray-50 focus:outline-none focus:bg-gray-50 text-gray-700"
            >
              <span className="text-sm font-medium">Custom Size...</span>
            </button>
          </div>
        </>
      )}

      {/* Custom Size Dialog */}
      <Dialog open={isCustomDialogOpen} onOpenChange={setIsCustomDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Custom Canvas Size</DialogTitle>
            <DialogDescription>
              Enter the dimensions for your custom canvas size. Maximum size is
              10,000 × 10,000 pixels.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <form.Field name="width">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Width (px)</Label>
                    <Input
                      id={field.name}
                      type="number"
                      placeholder="1920"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) =>
                        field.handleChange(Number(e.target.value) || 0)
                      }
                      min="1"
                      max="10000"
                      className="w-full"
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-sm text-red-600">
                        {field.state.meta.errors[0]?.message}
                      </p>
                    )}
                  </div>
                )}
              </form.Field>

              <form.Field name="height">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Height (px)</Label>
                    <Input
                      id={field.name}
                      type="number"
                      placeholder="1080"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) =>
                        field.handleChange(Number(e.target.value) || 0)
                      }
                      min="1"
                      max="10000"
                      className="w-full"
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-sm text-red-600">
                        {field.state.meta.errors[0]?.message}
                      </p>
                    )}
                  </div>
                )}
              </form.Field>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCustomDialogOpen(false)}
              >
                Cancel
              </Button>
              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
              >
                {([canSubmit, isSubmitting]) => (
                  <Button type="submit" disabled={!canSubmit}>
                    {isSubmitting ? 'Setting...' : 'Set Size'}
                  </Button>
                )}
              </form.Subscribe>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
