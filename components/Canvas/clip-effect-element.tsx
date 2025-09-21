'use client';

import React from 'react';
import Konva from 'konva';
import { Group } from 'react-konva';
import { CanvasElement } from '../../types/canvas';
import { CanvasElementRenderer } from './canvas-element-renderer';
import { useCanvasStore } from '../../store/canvas-store';

interface ClipEffectElementProps {
  element: CanvasElement;
  onSelect: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  canvasWidth: number;
  canvasHeight: number;
  isInsideLayer?: boolean;
}

export const ClipEffectElement: React.FC<ClipEffectElementProps> = ({
  element,
  onSelect,
  canvasWidth,
  canvasHeight,
  isInsideLayer = false,
}) => {
  const { updateElement } = useCanvasStore();

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    const { x, y } = e.target.position();
    updateElement(element.id, {
      transform: {
        ...element.transform,
        x,
        y,
      },
    });
  };

  const handleDragMove = (e: Konva.KonvaEventObject<DragEvent>) => {
    if (!isInsideLayer) return;

    const { x, y } = e.target.position();
    const stage = e.target.getStage();
    if (stage) {
      // Find the outside version and sync position
      const allGroups = stage.find('Group');
      const outsideGroup = allGroups.find(
        (group) =>
          group.getAttr('elementId') === element.id &&
          group.getAttr('layerType') === 'outside'
      );
      if (outsideGroup) {
        outsideGroup.position({ x, y });
      }
    }
  };

  return (
    <Group
      x={element.transform.x}
      y={element.transform.y}
      scaleX={element.transform.scaleX}
      scaleY={element.transform.scaleY}
      rotation={element.transform.rotation}
      opacity={element.opacity}
      visible={element.visible}
      draggable={!element.locked && isInsideLayer}
      listening={isInsideLayer}
      onDragEnd={isInsideLayer ? handleDragEnd : undefined}
      onDragMove={isInsideLayer ? handleDragMove : undefined}
      elementId={element.id}
      layerType={isInsideLayer ? 'inside' : 'outside'}
    >
      <CanvasElementRenderer
        element={{
          ...element,
          transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
        }}
        onSelect={isInsideLayer ? onSelect : () => {}}
      />
    </Group>
  );
};
