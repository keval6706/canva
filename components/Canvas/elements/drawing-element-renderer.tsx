'use client';

import React, { useRef, useEffect } from 'react';
import { Line, Group } from 'react-konva';
import Konva from 'konva';
import { DrawingElement } from '../../../types/canvas';
import { useCanvasStore } from '../../../store/canvas-store';

interface DrawingElementRendererProps {
  element: DrawingElement;
  isSelected: boolean;
  onSelect: (e: Konva.KonvaEventObject<MouseEvent>) => void;
}

export const DrawingElementRenderer: React.FC<DrawingElementRendererProps> = ({
  element,
  isSelected,
  onSelect,
}) => {
  const groupRef = useRef<Konva.Group>(null);
  const { updateElement } = useCanvasStore();

  const handleDragEnd = () => {
    if (!groupRef.current) return;

    updateElement(element.id, {
      transform: {
        ...element.transform,
        x: groupRef.current.x(),
        y: groupRef.current.y(),
      },
    });
  };

  return (
    <Group
      ref={groupRef}
      id={`element-${element.id}`}
      name={`element-${element.id}`}
      x={element.transform.x}
      y={element.transform.y}
      scaleX={element.transform.scaleX}
      scaleY={element.transform.scaleY}
      rotation={element.transform.rotation}
      opacity={element.opacity}
      draggable={!element.locked}
      onDragEnd={handleDragEnd}
      onClick={onSelect}
    >
      <Line
        points={element.points}
        stroke={element.stroke}
        strokeWidth={element.strokeWidth}
        opacity={element.opacity}
        lineCap={element.lineCap || 'round'}
        lineJoin={element.lineJoin || 'round'}
        tension={element.tension || 0}
        fill={element.fill}
        globalCompositeOperation="source-over"
      />
    </Group>
  );
};