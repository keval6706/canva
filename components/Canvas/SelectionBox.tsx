'use client';

import React from 'react';
import { Group, Rect } from 'react-konva';
import { useCanvasStore } from '../../store/canvasStore';

interface SelectionBoxProps {
  selectedIds: string[];
}

export const SelectionBox: React.FC<SelectionBoxProps> = ({ selectedIds }) => {
  const { elements, zoom } = useCanvasStore();
  
  if (selectedIds.length === 0) return null;

  const selectedElements = selectedIds
    .map(id => elements.find(el => el.id === id))
    .filter(Boolean);

  if (selectedElements.length === 0) return null;

  // Calculate bounding box for all selected elements
  const bounds = selectedElements.reduce((acc, element) => {
    if (!element) return acc;
    
    const { x, y, scaleX = 1, scaleY = 1 } = element.transform;
    
    // For simplicity, using default dimensions
    // In a real implementation, you'd calculate actual element bounds
    const width = 100 * scaleX;
    const height = 50 * scaleY;
    
    const left = x;
    const right = x + width;
    const top = y;
    const bottom = y + height;
    
    return {
      left: Math.min(acc.left, left),
      right: Math.max(acc.right, right),
      top: Math.min(acc.top, top),
      bottom: Math.max(acc.bottom, bottom)
    };
  }, {
    left: Infinity,
    right: -Infinity,
    top: Infinity,
    bottom: -Infinity
  });

  if (bounds.left === Infinity) return null;

  const width = bounds.right - bounds.left;
  const height = bounds.bottom - bounds.top;
  const strokeWidth = 2 / zoom;
  const dashArray = [5 / zoom, 5 / zoom];

  return (
    <Group>
      {/* Selection outline */}
      <Rect
        x={bounds.left}
        y={bounds.top}
        width={width}
        height={height}
        stroke="#007bff"
        strokeWidth={strokeWidth}
        dash={dashArray}
        fill="transparent"
        listening={false}
      />
      
      {/* Corner handles */}
      {[
        { x: bounds.left, y: bounds.top }, // top-left
        { x: bounds.right, y: bounds.top }, // top-right
        { x: bounds.right, y: bounds.bottom }, // bottom-right
        { x: bounds.left, y: bounds.bottom }, // bottom-left
      ].map((corner, index) => (
        <Rect
          key={index}
          x={corner.x - 4 / zoom}
          y={corner.y - 4 / zoom}
          width={8 / zoom}
          height={8 / zoom}
          fill="white"
          stroke="#007bff"
          strokeWidth={strokeWidth}
          listening={false}
        />
      ))}
      
      {/* Edge handles */}
      {[
        { x: bounds.left + width / 2, y: bounds.top }, // top
        { x: bounds.right, y: bounds.top + height / 2 }, // right
        { x: bounds.left + width / 2, y: bounds.bottom }, // bottom
        { x: bounds.left, y: bounds.top + height / 2 }, // left
      ].map((edge, index) => (
        <Rect
          key={`edge-${index}`}
          x={edge.x - 4 / zoom}
          y={edge.y - 4 / zoom}
          width={8 / zoom}
          height={8 / zoom}
          fill="white"
          stroke="#007bff"
          strokeWidth={strokeWidth}
          listening={false}
        />
      ))}
    </Group>
  );
};