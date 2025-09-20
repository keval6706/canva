'use client';

import React from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import { TextElement, ImageElement, ShapeElement, CanvasElement } from '../../types/canvas';

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
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Text
        </label>
        <textarea
          value={textElement.text}
          onChange={(e) => handleUpdate({ text: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          rows={3}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Font Size
          </label>
          <input
            type="number"
            value={textElement.fontSize}
            onChange={(e) => handleUpdate({ fontSize: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            min="8"
            max="200"
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Font Family
          </label>
          <select
            value={textElement.fontFamily}
            onChange={(e) => handleUpdate({ fontFamily: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="Arial">Arial</option>
            <option value="Helvetica">Helvetica</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Georgia">Georgia</option>
            <option value="Verdana">Verdana</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => handleUpdate({ 
            fontWeight: textElement.fontWeight === 'bold' ? 'normal' : 'bold' 
          })}
          className={`px-3 py-2 text-sm rounded ${
            textElement.fontWeight === 'bold'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Bold
        </button>
        
        <button
          onClick={() => handleUpdate({ 
            fontStyle: textElement.fontStyle === 'italic' ? 'normal' : 'italic' 
          })}
          className={`px-3 py-2 text-sm rounded ${
            textElement.fontStyle === 'italic'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Italic
        </button>
        
        <button
          onClick={() => handleUpdate({ 
            textDecoration: textElement.textDecoration === 'underline' ? 'none' : 'underline' 
          })}
          className={`px-3 py-2 text-sm rounded ${
            textElement.textDecoration === 'underline'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          U
        </button>
      </div>
      
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Color
        </label>
        <input
          type="color"
          value={textElement.fill}
          onChange={(e) => handleUpdate({ fill: e.target.value })}
          className="w-full h-10 border border-gray-300 rounded-md"
        />
      </div>
    </div>
  );

  const renderShapeProperties = (shapeElement: ShapeElement) => (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Fill Color
        </label>
        <input
          type="color"
          value={shapeElement.fill || '#000000'}
          onChange={(e) => handleUpdate({ fill: e.target.value })}
          className="w-full h-10 border border-gray-300 rounded-md"
        />
      </div>
      
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Stroke Color
        </label>
        <input
          type="color"
          value={shapeElement.stroke || '#000000'}
          onChange={(e) => handleUpdate({ stroke: e.target.value })}
          className="w-full h-10 border border-gray-300 rounded-md"
        />
      </div>
      
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Stroke Width
        </label>
        <input
          type="number"
          value={shapeElement.strokeWidth || 0}
          onChange={(e) => handleUpdate({ strokeWidth: parseInt(e.target.value) })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          min="0"
          max="20"
        />
      </div>
      
      {shapeElement.shapeType === 'rectangle' && (
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Corner Radius
          </label>
          <input
            type="number"
            value={shapeElement.cornerRadius || 0}
            onChange={(e) => handleUpdate({ cornerRadius: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
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
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Image URL
        </label>
        <input
          type="text"
          value={imageElement.src}
          onChange={(e) => handleUpdate({ src: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => handleUpdate({ flipX: !imageElement.flipX })}
          className={`px-3 py-2 text-sm rounded ${
            imageElement.flipX
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Flip X
        </button>
        
        <button
          onClick={() => handleUpdate({ flipY: !imageElement.flipY })}
          className={`px-3 py-2 text-sm rounded ${
            imageElement.flipY
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Flip Y
        </button>
      </div>
      
      {imageElement.filters && (
        <div className="space-y-3">
          <h4 className="text-xs font-medium text-gray-700">Filters</h4>
          
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Brightness: {imageElement.filters.brightness || 0}
            </label>
            <input
              type="range"
              min="-1"
              max="1"
              step="0.1"
              value={imageElement.filters.brightness || 0}
              onChange={(e) => handleUpdate({
                filters: {
                  ...imageElement.filters,
                  brightness: parseFloat(e.target.value)
                }
              })}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Contrast: {imageElement.filters.contrast || 0}
            </label>
            <input
              type="range"
              min="-1"
              max="1"
              step="0.1"
              value={imageElement.filters.contrast || 0}
              onChange={(e) => handleUpdate({
                filters: {
                  ...imageElement.filters,
                  contrast: parseFloat(e.target.value)
                }
              })}
              className="w-full"
            />
          </div>
        </div>
      )}
    </div>
  );

  const renderCommonProperties = () => (
    <div className="space-y-4 mt-6 pt-4 border-t border-gray-200">
      <h4 className="text-xs font-medium text-gray-700">Position & Transform</h4>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">X</label>
          <input
            type="number"
            value={Math.round(element.transform.x)}
            onChange={(e) => handleUpdate({
              transform: { ...element.transform, x: parseInt(e.target.value) }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Y</label>
          <input
            type="number"
            value={Math.round(element.transform.y)}
            onChange={(e) => handleUpdate({
              transform: { ...element.transform, y: parseInt(e.target.value) }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Opacity: {Math.round(element.opacity * 100)}%
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={element.opacity}
          onChange={(e) => handleUpdate({ opacity: parseFloat(e.target.value) })}
          className="w-full"
        />
      </div>
      
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Rotation: {Math.round(element.transform.rotation)}°
        </label>
        <input
          type="range"
          min="0"
          max="360"
          value={element.transform.rotation}
          onChange={(e) => handleUpdate({
            transform: { ...element.transform, rotation: parseInt(e.target.value) }
          })}
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