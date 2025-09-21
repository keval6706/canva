"use client";

import React, { useRef, useEffect, useState } from "react";
import { Transformer } from "react-konva";
import Konva from "konva";
import { useCanvasStore } from "../../store/canvas-store";
import { ElementType, TextElement } from "../../types/canvas";

interface TransformerOverlayProps {
  selectedIds: string[];
}

export const TransformerOverlay: React.FC<TransformerOverlayProps> = ({
  selectedIds,
}) => {
  const transformerRef = useRef<Konva.Transformer>(null);
  const [isProportionalScaling, setIsProportionalScaling] = useState(false);
  const { updateElement, elements } = useCanvasStore();

  // Get selected elements and create a dependency key for properties that affect visual size
  const selectedElementsKey = selectedIds
    .map((id) => {
      const element = elements.find((el) => el.id === id);
      if (!element) return "";

      // For text elements, include font properties that affect size
      if (element.type === ElementType.TEXT) {
        const textEl = element as TextElement;
        return `${id}-${textEl.fontSize}-${textEl.fontWeight}-${textEl.fontStyle}-${textEl.text}-${textEl.lineHeight}-${textEl.letterSpacing}`;
      }

      // For other elements, just include basic size-affecting properties
      return `${id}-${element.transform.scaleX}-${element.transform.scaleY}`;
    })
    .join("|");

  useEffect(() => {
    if (!transformerRef.current) return;

    const transformer = transformerRef.current;
    const stage = transformer.getStage();
    if (!stage) return;

    if (selectedIds.length === 0) {
      transformer.nodes([]);
      return;
    }

    // Find the selected element nodes in the stage
    const selectedNodes: Konva.Node[] = [];

    selectedIds.forEach((id) => {
      // Find the element node by traversing the stage
      const elementNode = stage.findOne(`#element-${id}`);
      if (elementNode) {
        selectedNodes.push(elementNode);
      }
    });

    if (selectedNodes.length > 0) {
      transformer.nodes(selectedNodes);
      transformer.getLayer()?.batchDraw();
    } else {
      transformer.nodes([]);
    }
  }, [selectedIds, selectedElementsKey]); // Watch both selectedIds and visual properties

  const handleTransform = (e: Konva.KonvaEventObject<Event>) => {
    const transformer = transformerRef.current;
    if (!transformer) return;

    const nodes = transformer.nodes();

    // Check if shift key is pressed for proportional scaling
    const isShiftPressed = e.evt && (e.evt as KeyboardEvent).shiftKey;
    setIsProportionalScaling(isShiftPressed);

    nodes.forEach((node) => {
      // Extract element ID from node name
      const elementId = node.name().replace("element-", "");
      if (!elementId) return;

      let scaleX = node.scaleX();
      let scaleY = node.scaleY();

      // If shift is pressed, maintain aspect ratio
      if (isShiftPressed) {
        // Calculate the smaller absolute scale to maintain aspect ratio
        const absScaleX = Math.abs(scaleX);
        const absScaleY = Math.abs(scaleY);
        const uniformScale = Math.min(absScaleX, absScaleY);

        // Preserve sign of the scale
        const signX = scaleX >= 0 ? 1 : -1;
        const signY = scaleY >= 0 ? 1 : -1;

        scaleX = uniformScale * signX;
        scaleY = uniformScale * signY;

        node.scaleX(scaleX);
        node.scaleY(scaleY);
      }

      // Get current element data
      const currentElements = useCanvasStore.getState().elements;
      const element = currentElements.find((el) => el.id === elementId);
      if (!element) return;

      // Update element with real-time transform values
      updateElement(elementId, {
        transform: {
          ...element.transform,
          x: node.x(),
          y: node.y(),
          scaleX: scaleX,
          scaleY: scaleY,
          rotation: node.rotation(),
        },
      });
    });
  };

  const handleTransformEnd = () => {
    const transformer = transformerRef.current;
    if (!transformer) return;

    const nodes = transformer.nodes();

    nodes.forEach((node) => {
      // Extract element ID from node name
      const elementId = node.name().replace("element-", "");
      if (!elementId) return;

      // Get fresh element data to avoid stale state
      const currentElements = useCanvasStore.getState().elements;
      const element = currentElements.find((el) => el.id === elementId);
      if (!element) return;

      // Get the final transform values from the node
      const finalX = node.x();
      const finalY = node.y();
      const finalScaleX = node.scaleX();
      const finalScaleY = node.scaleY();
      const finalRotation = node.rotation();

      // Clamp scale values to prevent extreme scaling
      const clampedScaleX =
        Math.max(0.1, Math.min(10, Math.abs(finalScaleX))) *
        (finalScaleX >= 0 ? 1 : -1);
      const clampedScaleY =
        Math.max(0.1, Math.min(10, Math.abs(finalScaleY))) *
        (finalScaleY >= 0 ? 1 : -1);

      // Only update if clamping is needed
      if (clampedScaleX !== finalScaleX || clampedScaleY !== finalScaleY) {
        updateElement(elementId, {
          transform: {
            ...element.transform,
            x: finalX,
            y: finalY,
            scaleX: clampedScaleX,
            scaleY: clampedScaleY,
            rotation: finalRotation,
          },
        });
      }

      // Reset the node position/rotation to match stored values
      node.x(finalX);
      node.y(finalY);
      node.rotation(finalRotation);
    });

    // Force transformer to update
    setTimeout(() => {
      if (transformer && transformer.getLayer()) {
        transformer.getLayer()?.batchDraw();
      }
    }, 10);
  };

  if (selectedIds.length === 0) {
    return null;
  }

  return (
    <Transformer
      ref={transformerRef}
      boundBoxFunc={(oldBox, newBox) => {
        // Prevent elements from being scaled too small or too large
        const minWidth = 10;
        const minHeight = 10;
        const maxWidth = 2000;
        const maxHeight = 2000;

        if (newBox.width < minWidth || newBox.height < minHeight) {
          return oldBox;
        }

        if (newBox.width > maxWidth || newBox.height > maxHeight) {
          return oldBox;
        }

        return newBox;
      }}
      onTransform={handleTransform}
      onTransformEnd={handleTransformEnd}
      keepRatio={false}
      centeredScaling={false}
      enabledAnchors={[
        "top-left",
        "top-center",
        "top-right",
        "middle-right",
        "bottom-right",
        "bottom-center",
        "bottom-left",
        "middle-left",
      ]}
      borderEnabled={true}
      borderStroke={isProportionalScaling ? "#ff6b6b" : "#0066ff"}
      borderStrokeWidth={isProportionalScaling ? 2 : 1}
      borderDash={isProportionalScaling ? [2, 2] : [3, 3]}
      anchorFill="white"
      anchorStroke={isProportionalScaling ? "#ff6b6b" : "#0066ff"}
      anchorStrokeWidth={1}
      anchorSize={8}
      anchorCornerRadius={2}
    />
  );
};
