"use client";

import React, { useRef } from "react";
import {
  Group,
  Rect,
  Circle,
  RegularPolygon,
  Line,
  Arrow,
  Star,
} from "react-konva";
import Konva from "konva";
import { ShapeElement } from "../../../types/canvas";
import { useCanvasStore } from "../../../store/canvas-store";

interface ShapeElementRendererProps {
  element: ShapeElement;
  onSelect: (e: Konva.KonvaEventObject<MouseEvent>) => void;
}

export const ShapeElementRenderer: React.FC<ShapeElementRendererProps> = ({
  element,
  onSelect,
}) => {
  const groupRef = useRef<Konva.Group>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const shapeRef = useRef<any>(null);

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

  if (!element.visible) return null;

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

  const renderShape = () => {
    const commonProps = {
      ref: shapeRef,
      fill: element.fill,
      stroke: element.stroke,
      strokeWidth: element.strokeWidth,
      dash: element.strokeDashArray,
      shadowColor: element.shadow?.color,
      shadowBlur: element.shadow?.blur,
      shadowOffsetX: element.shadow?.offset.x,
      shadowOffsetY: element.shadow?.offset.y,
    };

    switch (element.shapeType) {
      case "rectangle":
        return (
          <Rect
            {...commonProps}
            x={0}
            y={0}
            width={100}
            height={60}
            cornerRadius={element.cornerRadius}
          />
        );

      case "circle":
        return <Circle {...commonProps} x={50} y={50} radius={50} />;

      case "triangle":
        return (
          <RegularPolygon
            {...commonProps}
            x={50}
            y={50}
            sides={3}
            radius={50}
          />
        );

      case "polygon":
        return (
          <RegularPolygon
            {...commonProps}
            x={50}
            y={50}
            sides={element.sides || 6}
            radius={50}
          />
        );

      case "star":
        return (
          <Star
            {...commonProps}
            x={50}
            y={50}
            numPoints={element.sides || 5}
            innerRadius={element.innerRadius || 25}
            outerRadius={50}
          />
        );

      case "line":
        return (
          <Line {...commonProps} points={element.points || [0, 0, 100, 0]} />
        );

      case "arrow":
        return (
          <Arrow
            {...commonProps}
            points={element.points || [0, 50, 100, 50]}
            pointerLength={10}
            pointerWidth={10}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Group
      ref={groupRef}
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
      {renderShape()}
    </Group>
  );
};
