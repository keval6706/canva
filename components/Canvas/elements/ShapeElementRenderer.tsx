'use client';

import React, { useRef, useEffect } from 'react';
import { Group, Rect, Circle, RegularPolygon, Line, Arrow, Star, Transformer } from 'react-konva';
import Konva from 'konva';
import { ShapeElement } from '../../../types/canvas';
import { useCanvasStore } from '../../../store/canvasStore';

interface ShapeElementRendererProps {
  element: ShapeElement;
  isSelected: boolean;
  onSelect: (e: Konva.KonvaEventObject<MouseEvent>) => void;
}

export const ShapeElementRenderer: React.FC<ShapeElementRendererProps> = ({
  element,
  isSelected,
  onSelect,
}) => {
  const transformerRef = useRef<Konva.Transformer>(null);
  const groupRef = useRef<Konva.Group>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const shapeRef = useRef<any>(null);
  
  const { updateElement } = useCanvasStore();

  useEffect(() => {
    if (isSelected && transformerRef.current && groupRef.current) {
      transformerRef.current.nodes([groupRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  const handleTransformEnd = () => {
    if (!groupRef.current) return;

    const node = groupRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    // Reset scale and update transform
    node.scaleX(1);
    node.scaleY(1);

    updateElement(element.id, {
      transform: {
        ...element.transform,
        x: node.x(),
        y: node.y(),
        scaleX: element.transform.scaleX * scaleX,
        scaleY: element.transform.scaleY * scaleY,
        rotation: node.rotation(),
      },
    });
  };

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
      case 'rectangle':
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

      case 'circle':
        return (
          <Circle
            {...commonProps}
            x={50}
            y={50}
            radius={50}
          />
        );

      case 'triangle':
        return (
          <RegularPolygon
            {...commonProps}
            x={50}
            y={50}
            sides={3}
            radius={50}
          />
        );

      case 'polygon':
        return (
          <RegularPolygon
            {...commonProps}
            x={50}
            y={50}
            sides={element.sides || 6}
            radius={50}
          />
        );

      case 'star':
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

      case 'line':
        return (
          <Line
            {...commonProps}
            points={element.points || [0, 0, 100, 0]}
          />
        );

      case 'arrow':
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
      x={element.transform.x}
      y={element.transform.y}
      scaleX={element.transform.scaleX}
      scaleY={element.transform.scaleY}
      rotation={element.transform.rotation}
      opacity={element.opacity}
      draggable={!element.locked}
      onDragEnd={handleDragEnd}
      onTransformEnd={handleTransformEnd}
      onClick={onSelect}
    >
      {renderShape()}
      
      {isSelected && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 10 || newBox.height < 10) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </Group>
  );
};