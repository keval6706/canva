'use client';

import React from 'react';
import { Group } from 'react-konva';
import Konva from 'konva';
import { GroupElement, CanvasElement } from '../../../types/canvas';
import { CanvasElementRenderer } from '../canvas-element-renderer';
import { useCanvasStore } from '../../../store/canvas-store';

interface GroupElementRendererProps {
  element: GroupElement;
  isSelected: boolean;
  onSelect: (e: Konva.KonvaEventObject<MouseEvent>) => void;
}

export const GroupElementRenderer: React.FC<GroupElementRendererProps> = ({
  element,
  isSelected,
  onSelect,
}) => {
  const { elements, updateElement } = useCanvasStore();

  // Get child elements
  const childElements = element.children
    .map((childId) => elements.find((el) => el.id === childId))
    .filter(Boolean) as CanvasElement[];

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    const groupNode = e.target;
    updateElement(element.id, {
      transform: {
        ...element.transform,
        x: groupNode.x(),
        y: groupNode.y(),
      },
    });
  };

  return (
    <Group
      id={`element-${element.id}`}
      name={`element-${element.id}`}
      x={element.transform.x}
      y={element.transform.y}
      scaleX={element.transform.scaleX}
      scaleY={element.transform.scaleY}
      rotation={element.transform.rotation}
      opacity={element.opacity}
      visible={element.visible}
      draggable={!element.locked}
      onDragEnd={handleDragEnd}
      onClick={onSelect}
      onTap={onSelect}
    >
      {childElements.map((childElement) => (
        <CanvasElementRenderer
          key={childElement.id}
          element={childElement}
          isSelected={false} // Child elements are not individually selectable when in a group
          onSelect={(e: Konva.KonvaEventObject<MouseEvent>) => {
            // Prevent the child element from being selected individually
            e.cancelBubble = true;
            // Instead, select the parent group
            onSelect(e);
          }}
        />
      ))}
    </Group>
  );
};
