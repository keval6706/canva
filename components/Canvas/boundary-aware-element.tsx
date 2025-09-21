"use client";

import React, { useRef, useEffect, useCallback } from "react";
import Konva from "konva";
import { Group, Layer } from "react-konva";
import { CanvasElement } from "../../types/canvas";
import { CanvasElementRenderer } from "./canvas-element-renderer";
import { useCanvasStore } from "../../store/canvas-store";

interface BoundaryAwareElementProps {
  element: CanvasElement;
  onSelect: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  canvasWidth: number;
  canvasHeight: number;
}

export const BoundaryAwareElement: React.FC<BoundaryAwareElementProps> = ({
  element,
  onSelect,
  canvasWidth,
  canvasHeight,
}) => {
  const outsideGroupRef = useRef<Konva.Group>(null);
  const insideGroupRef = useRef<Konva.Group>(null);
  const { updateElement } = useCanvasStore();

  // Handle drag events
  const handleDragMove = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    const { x, y } = e.target.position();

    // Sync the outside group position
    if (outsideGroupRef.current) {
      outsideGroupRef.current.position({ x, y });
    }
  }, []);

  const handleDragEnd = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      const { x, y } = e.target.position();

      // Update element in store
      updateElement(element.id, {
        transform: {
          ...element.transform,
          x,
          y,
        },
      });
    },
    [element.id, element.transform, updateElement],
  );

  // Sync positions when element updates
  useEffect(() => {
    if (outsideGroupRef.current && insideGroupRef.current) {
      const position = { x: element.transform.x, y: element.transform.y };
      const scale = {
        x: element.transform.scaleX,
        y: element.transform.scaleY,
      };
      const rotation = element.transform.rotation;

      outsideGroupRef.current.position(position);
      outsideGroupRef.current.scale(scale);
      outsideGroupRef.current.rotation(rotation);
      outsideGroupRef.current.opacity(element.opacity);
      outsideGroupRef.current.visible(element.visible);

      insideGroupRef.current.position(position);
      insideGroupRef.current.scale(scale);
      insideGroupRef.current.rotation(rotation);
      insideGroupRef.current.opacity(element.opacity);
      insideGroupRef.current.visible(element.visible);
    }
  }, [element]);

  return (
    <>
      {/* Outside element - reduced opacity, not clipped */}
      <Group ref={outsideGroupRef} listening={false}>
        <CanvasElementRenderer
          element={{
            ...element,
            transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
          }}
          onSelect={() => {}}
        />
      </Group>

      {/* Inside element - full opacity, clipped, interactive */}
      <Group
        ref={insideGroupRef}
        draggable={!element.locked}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        listening={true}
      >
        <CanvasElementRenderer
          element={{
            ...element,
            transform: { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
          }}
          onSelect={onSelect}
        />
      </Group>
    </>
  );
};
