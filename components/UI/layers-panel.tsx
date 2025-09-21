"use client";

import React from "react";
import {
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  LockOpenIcon,
  TrashIcon,
  DocumentDuplicateIcon,
} from "@heroicons/react/24/outline";
import { useCanvasStore } from "../../store/canvas-store";
import { CanvasElement } from "../../types/canvas";
import { Button } from "./button";

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
    moveElementDown,
  } = useCanvasStore();

  // Sort elements by zIndex (highest first for display)
  const sortedElements = [...elements].sort((a, b) => b.zIndex - a.zIndex);

  const handleElementClick = (elementId: string, event: React.MouseEvent) => {
    if (event.ctrlKey || event.metaKey) {
      // Multi-select
      if (selectedIds.includes(elementId)) {
        selectElements(selectedIds.filter((id) => id !== elementId));
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
      case "text":
        return "📝";
      case "image":
        return "🖼️";
      case "shape":
        return "🔷";
      case "background":
        return "🖼️";
      case "sticker":
        return "✨";
      default:
        return "📄";
    }
  };

  const getElementName = (element: CanvasElement) => {
    return (
      element.name ||
      `${element.type.charAt(0).toUpperCase() + element.type.slice(1)} ${element.id.slice(0, 4)}`
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Layers</h3>
          <div className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {elements.length} elements
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {sortedElements.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-gray-400 text-4xl mb-3">📄</div>
            <div className="text-sm text-gray-500">No elements in canvas</div>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {sortedElements.map((element) => (
              <div
                key={element.id}
                onClick={(e) => handleElementClick(element.id, e)}
                className={`group flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                  selectedIds.includes(element.id)
                    ? "bg-blue-50 border border-blue-200 shadow-sm"
                    : "hover:bg-gray-50 border border-transparent hover:shadow-sm"
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
                  <div className="text-xs text-gray-500 capitalize">
                    {element.type}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleVisibility(element.id, element.visible);
                    }}
                    variant="ghost"
                    size="sm"
                    title={element.visible ? "Hide" : "Show"}
                    className="h-8 w-8 p-0 hover:bg-gray-200"
                  >
                    {element.visible ? (
                      <EyeIcon className="w-4 h-4" />
                    ) : (
                      <EyeSlashIcon className="w-4 h-4" />
                    )}
                  </Button>

                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLock(element.id, element.locked);
                    }}
                    variant="ghost"
                    size="sm"
                    title={element.locked ? "Unlock" : "Lock"}
                    className="h-8 w-8 p-0 hover:bg-gray-200"
                  >
                    {element.locked ? (
                      <LockClosedIcon className="w-4 h-4" />
                    ) : (
                      <LockOpenIcon className="w-4 h-4" />
                    )}
                  </Button>

                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateElement(element.id);
                    }}
                    variant="ghost"
                    size="sm"
                    title="Duplicate"
                    className="h-8 w-8 p-0 hover:bg-gray-200"
                  >
                    <DocumentDuplicateIcon className="w-4 h-4" />
                  </Button>

                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteElement(element.id);
                    }}
                    variant="ghost"
                    size="sm"
                    title="Delete"
                    className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Layer Actions */}
      {selectedIds.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex space-x-3">
            <Button
              onClick={() => selectedIds.forEach((id) => moveElementUp(id))}
              variant="outline"
              size="sm"
              className="flex-1 h-9"
            >
              ↑ Forward
            </Button>
            <Button
              onClick={() => selectedIds.forEach((id) => moveElementDown(id))}
              variant="outline"
              size="sm"
              className="flex-1 h-9"
            >
              ↓ Backward
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
