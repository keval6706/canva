"use client";

import React, { useRef } from "react";
import Konva from "konva";
import { Group } from "react-konva";
import { CanvasElement } from "../../types/canvas";
import { CanvasElementRenderer } from "./canvas-element-renderer";

interface DualRenderElementProps {
  element: CanvasElement;
  onSelect: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  onDragEnd: (elementId: string, x: number, y: number) => void;
  onDragMove?: (elementId: string, x: number, y: number) => void;
  layerType: "outside" | "inside";
}

export const DualRenderElement: React.FC<DualRenderElementProps> = ({
  element,
  onSelect,
  onDragEnd,
  onDragMove,
  layerType,
}) => {
  const groupRef = useRef<Konva.Group>(null);

  // For the outside layer, we need to handle selection AND dragging for elements outside canvas
  if (layerType === "outside") {
    const handleDragMove = (e: Konva.KonvaEventObject<DragEvent>) => {
      const { x, y } = e.target.position();
      if (onDragMove) {
        onDragMove(element.id, x, y);
      }
    };

    const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
      const { x, y } = e.target.position();
      onDragEnd(element.id, x, y);
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
        draggable={!element.locked} // Enable dragging for outside layer
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
      >
        <CanvasElementRenderer
          element={{
            ...element,
            transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
            locked: true, // Disable dragging in the individual renderer
          }}
          onSelect={onSelect} // Allow selection on outside elements
        />
      </Group>
    );
  }

  // For the inside layer, we handle all interactions
  const handleDragMove = (e: Konva.KonvaEventObject<DragEvent>) => {
    // Real-time position update during drag
    const { x, y } = e.target.position();
    if (onDragMove) {
      onDragMove(element.id, x, y);
    }
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
          locked: true, // Disable dragging in the individual renderer
        }}
        onSelect={onSelect}
      />
    </Group>
  );
};
