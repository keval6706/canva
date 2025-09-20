'use client';

import React from 'react';
import { 
  EyeIcon, 
  EyeSlashIcon, 
  LockClosedIcon, 
  LockOpenIcon,
  TrashIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';
import { useCanvasStore } from '../../store/canvasStore';
import { CanvasElement } from '../../types/canvas';

export const LayersPanel: React.FC = () => {
  const { 
    elements, 
    selectedIds, 
    selectElement, 
    selectElements,
    updateElement, 
    deleteElement, 
    duplicateElement,
    moveElementUp,
    moveElementDown
  } = useCanvasStore();

  // Sort elements by zIndex (highest first for display)
  const sortedElements = [...elements].sort((a, b) => b.zIndex - a.zIndex);

  const handleElementClick = (elementId: string, event: React.MouseEvent) => {
    if (event.ctrlKey || event.metaKey) {
      // Multi-select
      if (selectedIds.includes(elementId)) {
        selectElements(selectedIds.filter(id => id !== elementId));
      } else {
        selectElements([...selectedIds, elementId]);
      }
    } else {
      selectElement(elementId);
    }
  };

  const toggleVisibility = (elementId: string, visible: boolean) => {
    updateElement(elementId, { visible: !visible });
  };

  const toggleLock = (elementId: string, locked: boolean) => {
    updateElement(elementId, { locked: !locked });
  };

  const getElementIcon = (element: CanvasElement) => {
    switch (element.type) {
      case 'text':
        return '📝';
      case 'image':
        return '🖼️';
      case 'shape':
        return '🔷';
      case 'background':
        return '🖼️';
      case 'sticker':
        return '✨';
      default:
        return '📄';
    }
  };

  const getElementName = (element: CanvasElement) => {
    return element.name || `${element.type.charAt(0).toUpperCase() + element.type.slice(1)} ${element.id.slice(0, 4)}`;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">Layers</h3>
          <div className="text-xs text-gray-500">
            {elements.length} elements
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {sortedElements.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">
            No elements in canvas
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {sortedElements.map((element) => (
              <div
                key={element.id}
                onClick={(e) => handleElementClick(element.id, e)}
                className={`group flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors ${
                  selectedIds.includes(element.id)
                    ? 'bg-blue-100 border border-blue-300'
                    : 'hover:bg-gray-50 border border-transparent'
                }`}
              >
                {/* Element Icon */}
                <span className="text-lg flex-shrink-0">
                  {getElementIcon(element)}
                </span>
                
                {/* Element Name */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {getElementName(element)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {element.type}
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleVisibility(element.id, element.visible);
                    }}
                    className="p-1 hover:bg-gray-200 rounded"
                    title={element.visible ? 'Hide' : 'Show'}
                  >
                    {element.visible ? (
                      <EyeIcon className="w-4 h-4 text-gray-600" />
                    ) : (
                      <EyeSlashIcon className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLock(element.id, element.locked);
                    }}
                    className="p-1 hover:bg-gray-200 rounded"
                    title={element.locked ? 'Unlock' : 'Lock'}
                  >
                    {element.locked ? (
                      <LockClosedIcon className="w-4 h-4 text-gray-600" />
                    ) : (
                      <LockOpenIcon className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateElement(element.id);
                    }}
                    className="p-1 hover:bg-gray-200 rounded"
                    title="Duplicate"
                  >
                    <DocumentDuplicateIcon className="w-4 h-4 text-gray-600" />
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteElement(element.id);
                    }}
                    className="p-1 hover:bg-red-100 rounded"
                    title="Delete"
                  >
                    <TrashIcon className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Layer Actions */}
      {selectedIds.length > 0 && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <button
              onClick={() => selectedIds.forEach(id => moveElementUp(id))}
              className="flex-1 px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Bring Forward
            </button>
            <button
              onClick={() => selectedIds.forEach(id => moveElementDown(id))}
              className="flex-1 px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Send Backward
            </button>
          </div>
        </div>
      )}
    </div>
  );
};