'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Text, Group } from 'react-konva';
import Konva from 'konva';
import { TextElement } from '../../../types/canvas';
import { useCanvasStore } from '../../../store/canvas-store';

interface TextElementRendererProps {
  element: TextElement;
  isSelected: boolean;
  onSelect: (e: Konva.KonvaEventObject<MouseEvent>) => void;
}

export const TextElementRenderer: React.FC<TextElementRendererProps> = ({
  element,
  isSelected,
  onSelect,
}) => {
  const textRef = useRef<Konva.Text>(null);
  const groupRef = useRef<Konva.Group>(null);
  const [isEditing, setIsEditing] = useState(false);
  
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

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleTextChange = useCallback((e: Event) => {
    const target = e.target as HTMLTextAreaElement;
    updateElement(element.id, { text: target.value });
  }, [element.id, updateElement]);

  const handleEditingEnd = () => {
    setIsEditing(false);
  };

  useEffect(() => {
    if (isEditing && textRef.current) {
      const textNode = textRef.current;
      const stage = textNode.getStage();
      if (!stage) return;

      // Create textarea for editing
      const textarea = document.createElement('textarea');
      const container = stage.container();
      container.appendChild(textarea);

      // Position textarea over text
      const textPosition = textNode.absolutePosition();
      const stageBox = stage.container().getBoundingClientRect();
      const areaPosition = {
        x: stageBox.left + textPosition.x,
        y: stageBox.top + textPosition.y,
      };

      textarea.value = element.text;
      textarea.style.position = 'absolute';
      textarea.style.top = areaPosition.y + 'px';
      textarea.style.left = areaPosition.x + 'px';
      textarea.style.width = Math.max(textNode.width(), 100) + 'px';
      textarea.style.height = Math.max(textNode.height(), 50) + 'px';
      textarea.style.fontSize = element.fontSize + 'px';
      textarea.style.fontFamily = element.fontFamily;
      textarea.style.fontWeight = element.fontWeight;
      textarea.style.fontStyle = element.fontStyle;
      textarea.style.color = element.fill;
      textarea.style.border = '2px solid #007bff';
      textarea.style.background = 'white';
      textarea.style.outline = 'none';
      textarea.style.resize = 'none';
      textarea.style.zIndex = '1000';

      textarea.focus();
      textarea.select();

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleEditingEnd();
        } else if (e.key === 'Escape') {
          handleEditingEnd();
        }
      };

      textarea.addEventListener('keydown', handleKeyDown);
      textarea.addEventListener('blur', handleEditingEnd);
      textarea.addEventListener('input', handleTextChange);

      const cleanup = () => {
        textarea.removeEventListener('keydown', handleKeyDown);
        textarea.removeEventListener('blur', handleEditingEnd);
        textarea.removeEventListener('input', handleTextChange);
        container.removeChild(textarea);
        setIsEditing(false);
      };

      return cleanup;
    }
  }, [isEditing, element.text, element.fontSize, element.fontFamily, element.fontWeight, element.fontStyle, element.fill, handleTextChange]);

  if (!element.visible) return null;

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
      draggable={!element.locked && !isEditing}
      onDragEnd={handleDragEnd}
      onClick={onSelect}
      onDblClick={handleDoubleClick}
    >
      <Text
        ref={textRef}
        text={element.text}
        fontSize={element.fontSize}
        fontFamily={element.fontFamily}
        fontStyle={element.fontWeight === 'bold' ? 'bold' : element.fontStyle}
        textDecoration={element.textDecoration}
        fill={element.fill}
        stroke={element.stroke}
        strokeWidth={element.strokeWidth || 0}
        align={element.align}
        verticalAlign={element.verticalAlign}
        lineHeight={element.lineHeight}
        letterSpacing={element.letterSpacing}
        padding={element.padding}
        width={element.width}
        height={element.height}
        wrap={element.wrap}
        ellipsis={element.ellipsis}
        shadowColor={element.shadow?.color}
        shadowBlur={element.shadow?.blur}
        shadowOffsetX={element.shadow?.offset.x}
        shadowOffsetY={element.shadow?.offset.y}
        listening={!isEditing}
      />
    </Group>
  );
};