"use client";

import React, { useRef } from "react";
import { Line, Group } from "react-konva";
import Konva from "konva";
import { DrawingElement } from "../../../types/canvas";
import { useCanvasStore } from "../../../store/canvas-store";

interface DrawingElementRendererProps {
  element: DrawingElement;
  onSelect: (e: Konva.KonvaEventObject<MouseEvent>) => void;
}

export const DrawingElementRenderer: React.FC<DrawingElementRendererProps> = ({
  element,
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

  // If element is part of a group, use relative transform (group handles absolute positioning)
  const isInGroup = element.groupId !== undefined;
  const transform = isInGroup
    ? {
        x: element.transform.x,
        y: element.transform.y,
        scaleX: element.transform.scaleX,
        scaleY: element.transform.scaleY,
        rotation: element.transform.rotation,
      }
    : element.transform;

  return (
    <Group
      ref={groupRef}
      id={`element-${element.id}`}
      name={`element-${element.id}`}
      x={transform.x}
      y={transform.y}
      scaleX={transform.scaleX}
      scaleY={transform.scaleY}
      rotation={transform.rotation}
      opacity={element.opacity}
      draggable={!element.locked && !isInGroup} // Don't allow dragging when in group
      onDragEnd={handleDragEnd}
      onClick={onSelect}
    >
      <Line
        points={element.points}
        stroke={element.stroke}
        strokeWidth={element.strokeWidth}
        opacity={element.opacity}
        lineCap={element.lineCap || "round"}
        lineJoin={element.lineJoin || "round"}
        tension={element.tension || 0}
        fill={element.fill}
        globalCompositeOperation="source-over"
      />
    </Group>
  );
};
