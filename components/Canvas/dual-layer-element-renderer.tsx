"use client";

import React, { useRef, useEffect, useCallback } from "react";
import Konva from "konva";
import { Group } from "react-konva";
import { CanvasElement } from "../../types/canvas";
import { CanvasElementRenderer } from "./canvas-element-renderer";
import { useCanvasStore } from "../../store/canvas-store";
import {
  isElementOutsideCanvas as checkElementOutsideCanvas,
  getElementBounds,
} from "../../utils/element-bounds";

interface DualLayerElementRendererProps {
  element: CanvasElement;
  onSelect: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  layerType: "inside" | "outside";
  canvasWidth: number;
  canvasHeight: number;
}

export const DualLayerElementRenderer: React.FC<
  DualLayerElementRendererProps
> = ({ element, onSelect, layerType, canvasWidth, canvasHeight }) => {
  const groupRef = useRef<Konva.Group>(null);
  const { updateElement } = useCanvasStore();

  // Sync element transforms between layers
  const syncTransform = useCallback(() => {
    const group = groupRef.current;
    if (!group) return;

    // Set transform properties
    group.position({
      x: element.transform.x,
      y: element.transform.y,
    });
    group.scale({
      x: element.transform.scaleX,
      y: element.transform.scaleY,
    });
    group.rotation(element.transform.rotation);
    group.opacity(element.opacity);
    group.visible(element.visible);
  }, [element]);

  // Handle drag events to sync between layers and update store
  const handleDragMove = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      const { x, y } = e.target.position();

      // Find the corresponding element in the other layer and sync position
      const stage = e.target.getStage();
      if (stage) {
        const otherLayerType = layerType === "inside" ? "outside" : "inside";
        const otherLayerGroup = stage.findOne(
          `#${otherLayerType}-${element.id}`,
        );
        if (otherLayerGroup) {
          otherLayerGroup.position({ x, y });
          stage.batchDraw();
        }
      }
    },
    [layerType, element.id],
  );

  const handleDragEnd = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      const { x, y } = e.target.position();

      // Update element in store only on drag end to avoid excessive updates
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

  const handleTransformEnd = useCallback(
    (e: Konva.KonvaEventObject<Event>) => {
      const node = e.target;
      const stage = node.getStage();
      const position = node.position();
      const scale = node.scale();
      const rotation = node.rotation();

      // Update element in store
      updateElement(element.id, {
        transform: {
          ...element.transform,
          x: position.x,
          y: position.y,
          scaleX: scale.x,
          scaleY: scale.y,
          rotation: rotation,
        },
      });

      if (stage) {
        const otherLayerType = layerType === "inside" ? "outside" : "inside";
        const otherLayerGroup = stage.findOne(
          `#${otherLayerType}-${element.id}`,
        );
        if (otherLayerGroup) {
          otherLayerGroup.position(position);
          otherLayerGroup.scale(scale);
          otherLayerGroup.rotation(rotation);
          stage.batchDraw();
        }
      }
    },
    [layerType, element.id, element.transform, updateElement],
  );

  // Apply transforms when element updates
  useEffect(() => {
    syncTransform();
  }, [syncTransform]);

  // Simple event handling: only inside layer handles interaction
  const shouldHandleEvents = layerType === "inside";

  return (
    <Group
      ref={groupRef}
      id={`${layerType}-${element.id}`}
      draggable={!element.locked && shouldHandleEvents}
      onDragMove={shouldHandleEvents ? handleDragMove : undefined}
      onDragEnd={shouldHandleEvents ? handleDragEnd : undefined}
      onTransformEnd={shouldHandleEvents ? handleTransformEnd : undefined}
      listening={shouldHandleEvents}
    >
      <CanvasElementRenderer
        element={element}
        onSelect={shouldHandleEvents ? onSelect : () => {}}
      />
    </Group>
  );
};
