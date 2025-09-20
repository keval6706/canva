'use client';

import React from 'react';
import { Group, Rect } from 'react-konva';
import { useCanvasStore } from '../../store/canvasStore';
import { getCombinedBounds } from '../../utils/elementBounds';

interface SelectionBoxProps {
  selectedIds: string[];
}

export const SelectionBox: React.FC<SelectionBoxProps> = ({ selectedIds }) => {
  const { elements, zoom } = useCanvasStore();
  
  if (selectedIds.length === 0) return null;

  const selectedElements = selectedIds
    .map(id => elements.find(el => el.id === id))
    .filter((element): element is NonNullable<typeof element> => element !== undefined);

  if (selectedElements.length === 0) return null;

  // Calculate actual bounds for all selected elements
  const bounds = getCombinedBounds(selectedElements);
  
  if (!bounds) return null;

  const strokeWidth = 2 / zoom;
  const dashArray = [5 / zoom, 5 / zoom];
  const handleSize = 8 / zoom;

  return (
    <Group>
      {/* Selection outline */}
      <Rect
        x={bounds.x}
        y={bounds.y}
        width={bounds.width}
        height={bounds.height}
        stroke="#007bff"
        strokeWidth={strokeWidth}
        dash={dashArray}
        fill="transparent"
        listening={false}
      />
      
      {/* Corner handles */}
      {[
        { x: bounds.x, y: bounds.y }, // top-left
        { x: bounds.x + bounds.width, y: bounds.y }, // top-right
        { x: bounds.x + bounds.width, y: bounds.y + bounds.height }, // bottom-right
        { x: bounds.x, y: bounds.y + bounds.height }, // bottom-left
      ].map((corner, index) => (
        <Rect
          key={index}
          x={corner.x - handleSize / 2}
          y={corner.y - handleSize / 2}
          width={handleSize}
          height={handleSize}
          fill="white"
          stroke="#007bff"
          strokeWidth={strokeWidth}
          listening={false}
        />
      ))}
      
      {/* Edge handles */}
      {[
        { x: bounds.x + bounds.width / 2, y: bounds.y }, // top
        { x: bounds.x + bounds.width, y: bounds.y + bounds.height / 2 }, // right
        { x: bounds.x + bounds.width / 2, y: bounds.y + bounds.height }, // bottom
        { x: bounds.x, y: bounds.y + bounds.height / 2 }, // left
      ].map((edge, index) => (
        <Rect
          key={`edge-${index}`}
          x={edge.x - handleSize / 2}
          y={edge.y - handleSize / 2}
          width={handleSize}
          height={handleSize}
          fill="white"
          stroke="#007bff"
          strokeWidth={strokeWidth}
          listening={false}
        />
      ))}
    </Group>
  );
};