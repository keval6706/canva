"use client";

import React, { useRef, useEffect, useCallback } from "react";
import Konva from "konva";
import { Group } from "react-konva";
import { CanvasElement } from "../../types/canvas";
import { CanvasElementRenderer } from "./canvas-element-renderer";

interface UnifiedElementRendererProps {
  element: CanvasElement;
  onSelect: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onDragEnd: (elementId: string, x: number, y: number) => void;
  canvasWidth: number;
  canvasHeight: number;
}

export const UnifiedElementRenderer: React.FC<UnifiedElementRendererProps> = ({
  element,
  onSelect,
  onDragEnd,
  canvasWidth,
  canvasHeight,
}) => {
  const groupRef = useRef<Konva.Group>(null);

  // Calculate if element is outside canvas bounds
  const isPartiallyOutside = useCallback(() => {
    const { x, y } = element.transform;
    return x < 0 || y < 0 || x > canvasWidth || y > canvasHeight;
  }, [element.transform, canvasWidth, canvasHeight]);

  // Apply opacity based on position
  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    // Reduce opacity if element is partially outside
    const opacity = isPartiallyOutside()
      ? element.opacity * 0.3
      : element.opacity;
    group.opacity(opacity);
  }, [
    element.transform.x,
    element.transform.y,
    element.opacity,
    canvasWidth,
    canvasHeight,
    isPartiallyOutside,
  ]);

  const handleDragMove = () => {
    // Update opacity during drag
    const group = groupRef.current;
    if (!group) return;

    const opacity = isPartiallyOutside()
      ? element.opacity * 0.3
      : element.opacity;
    group.opacity(opacity);
  };

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    const { x, y } = e.target.position();
    onDragEnd(element.id, x, y);
  };

  return (
    <Group
      ref={groupRef}
      x={element.transform.x}
      y={element.transform.y}
      scaleX={element.transform.scaleX}
      scaleY={element.transform.scaleY}
      rotation={element.transform.rotation}
      opacity={element.opacity}
      visible={element.visible}
      draggable={!element.locked}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
    >
      <CanvasElementRenderer
        element={{
          ...element,
          transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
        }}
        onSelect={onSelect}
      />
    </Group>
  );
};
