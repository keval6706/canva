'use client';

import React from 'react';
import { useCanvasStore } from '../../store/canvas-store';
import { TextElement, ImageElement, ShapeElement, CanvasElement } from '../../types/canvas';
import { Input } from './input';
import { Label } from './label';
import { Button } from './button';
import { Slider } from './slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';

export const PropertiesPanel: React.FC = () => {
  const { selectedIds, elements, updateElement } = useCanvasStore();

  if (selectedIds.length === 0) {
    return (
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Properties</h3>
        <div className="text-sm text-gray-500">
          Select an element to edit its properties
        </div>
      </div>
    );
  }

  if (selectedIds.length > 1) {
    return (
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Properties</h3>
        <div className="text-sm text-gray-500">
          Multiple elements selected
        </div>
      </div>
    );
  }

  const element = elements.find(el => el.id === selectedIds[0]);
  if (!element) return null;

  const handleUpdate = (updates: Partial<CanvasElement>) => {
    updateElement(element.id, updates);
  };

  const renderTextProperties = (textElement: TextElement) => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="text-content">Text</Label>
        <textarea
          id="text-content"
          value={textElement.text}
          onChange={(e) => handleUpdate({ text: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          rows={3}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="font-size">Font Size</Label>
          <Input
            id="font-size"
            type="number"
            value={textElement.fontSize}
            onChange={(e) => handleUpdate({ fontSize: parseInt(e.target.value) })}
            min="8"
            max="200"
          />
        </div>
        
        <div>
          <Label htmlFor="font-family">Font Family</Label>
          <Select
            value={textElement.fontFamily}
            onValueChange={(value) => handleUpdate({ fontFamily: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Arial">Arial</SelectItem>
              <SelectItem value="Helvetica">Helvetica</SelectItem>
              <SelectItem value="Times New Roman">Times New Roman</SelectItem>
              <SelectItem value="Georgia">Georgia</SelectItem>
              <SelectItem value="Verdana">Verdana</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        <Button
          onClick={() => handleUpdate({ 
            fontWeight: textElement.fontWeight === 'bold' ? 'normal' : 'bold' 
          })}
          variant={textElement.fontWeight === 'bold' ? 'default' : 'outline'}
          size="sm"
        >
          Bold
        </Button>
        
        <Button
          onClick={() => handleUpdate({ 
            fontStyle: textElement.fontStyle === 'italic' ? 'normal' : 'italic' 
          })}
          variant={textElement.fontStyle === 'italic' ? 'default' : 'outline'}
          size="sm"
        >
          Italic
        </Button>
        
        <Button
          onClick={() => handleUpdate({ 
            textDecoration: textElement.textDecoration === 'underline' ? 'none' : 'underline' 
          })}
          variant={textElement.textDecoration === 'underline' ? 'default' : 'outline'}
          size="sm"
        >
          U
        </Button>
      </div>
      
      <div>
        <Label htmlFor="text-color">Color</Label>
        <Input
          id="text-color"
          type="color"
          value={textElement.fill}
          onChange={(e) => handleUpdate({ fill: e.target.value })}
          className="w-full h-10"
        />
      </div>
    </div>
  );

  const renderShapeProperties = (shapeElement: ShapeElement) => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="fill-color">Fill Color</Label>
        <Input
          id="fill-color"
          type="color"
          value={shapeElement.fill || '#000000'}
          onChange={(e) => handleUpdate({ fill: e.target.value })}
          className="w-full h-10"
        />
      </div>
      
      <div>
        <Label htmlFor="stroke-color">Stroke Color</Label>
        <Input
          id="stroke-color"
          type="color"
          value={shapeElement.stroke || '#000000'}
          onChange={(e) => handleUpdate({ stroke: e.target.value })}
          className="w-full h-10"
        />
      </div>
      
      <div>
        <Label htmlFor="stroke-width">Stroke Width</Label>
        <Input
          id="stroke-width"
          type="number"
          value={shapeElement.strokeWidth || 0}
          onChange={(e) => handleUpdate({ strokeWidth: parseInt(e.target.value) })}
          min="0"
          max="20"
        />
      </div>
      
      {shapeElement.shapeType === 'rectangle' && (
        <div>
          <Label htmlFor="corner-radius">Corner Radius</Label>
          <Input
            id="corner-radius"
            type="number"
            value={shapeElement.cornerRadius || 0}
            onChange={(e) => handleUpdate({ cornerRadius: parseInt(e.target.value) })}
            min="0"
            max="50"
          />
        </div>
      )}
    </div>
  );

  const renderImageProperties = (imageElement: ImageElement) => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="image-url">Image URL</Label>
        <Input
          id="image-url"
          type="text"
          value={imageElement.src}
          onChange={(e) => handleUpdate({ src: e.target.value })}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={() => handleUpdate({ flipX: !imageElement.flipX })}
          variant={imageElement.flipX ? 'default' : 'outline'}
          size="sm"
        >
          Flip X
        </Button>
        
        <Button
          onClick={() => handleUpdate({ flipY: !imageElement.flipY })}
          variant={imageElement.flipY ? 'default' : 'outline'}
          size="sm"
        >
          Flip Y
        </Button>
      </div>
      
      {imageElement.filters && (
        <div className="space-y-3">
          <h4 className="text-xs font-medium text-gray-700">Filters</h4>
          
          <div>
            <Label>Brightness: {imageElement.filters.brightness || 0}</Label>
            <Slider
              value={[imageElement.filters.brightness || 0]}
              onValueChange={(value) => handleUpdate({
                filters: {
                  ...imageElement.filters,
                  brightness: value[0]
                }
              })}
              min={-1}
              max={1}
              step={0.1}
              className="w-full"
            />
          </div>
          
          <div>
            <Label>Contrast: {imageElement.filters.contrast || 0}</Label>
            <Slider
              value={[imageElement.filters.contrast || 0]}
              onValueChange={(value) => handleUpdate({
                filters: {
                  ...imageElement.filters,
                  contrast: value[0]
                }
              })}
              min={-1}
              max={1}
              step={0.1}
              className="w-full"
            />
          </div>
        </div>
      )}
    </div>
  );

  const renderCommonProperties = () => (
    <div className="space-y-4 mt-6 pt-4 border-t border-gray-200">
      <h4 className="text-sm font-medium">Position & Transform</h4>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="pos-x">X</Label>
          <Input
            id="pos-x"
            type="number"
            value={Math.round(element.transform.x)}
            onChange={(e) => handleUpdate({
              transform: { ...element.transform, x: parseInt(e.target.value) }
            })}
          />
        </div>
        
        <div>
          <Label htmlFor="pos-y">Y</Label>
          <Input
            id="pos-y"
            type="number"
            value={Math.round(element.transform.y)}
            onChange={(e) => handleUpdate({
              transform: { ...element.transform, y: parseInt(e.target.value) }
            })}
          />
        </div>
      </div>
      
      <div>
        <Label>Opacity: {Math.round(element.opacity * 100)}%</Label>
        <Slider
          value={[element.opacity]}
          onValueChange={(value) => handleUpdate({ opacity: value[0] })}
          min={0}
          max={1}
          step={0.01}
          className="w-full"
        />
      </div>
      
      <div>
        <Label>Rotation: {Math.round(element.transform.rotation)}°</Label>
        <Slider
          value={[element.transform.rotation]}
          onValueChange={(value) => handleUpdate({
            transform: { ...element.transform, rotation: value[0] }
          })}
          min={0}
          max={360}
          step={1}
          className="w-full"
        />
      </div>
    </div>
  );

  return (
    <div className="p-4 overflow-y-auto">
      <h3 className="text-sm font-medium text-gray-900 mb-4">Properties</h3>
      
      <div className="mb-4">
        <div className="text-xs text-gray-500 mb-2">Element Type</div>
        <div className="text-sm font-medium text-gray-900 capitalize">
          {element.type}
        </div>
      </div>
      
      {element.type === 'text' && renderTextProperties(element as TextElement)}
      {element.type === 'shape' && renderShapeProperties(element as ShapeElement)}
      {element.type === 'image' && renderImageProperties(element as ImageElement)}
      
      {renderCommonProperties()}
    </div>
  );
};