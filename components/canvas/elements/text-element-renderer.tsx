'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Text, Group, Transformer } from 'react-konva';
import Konva from 'konva';
import { TextElement } from '../../../types/canvas';
import { useCanvasStore } from '../../../store/canvas-store';
import { Html } from 'react-konva-utils';

// @ts-ignore
Konva._fixTextRendering = true;
interface TextElementRendererProps {
  element: TextElement;
  onSelect: (e: Konva.KonvaEventObject<MouseEvent>) => void;
}

export const TextElementRenderer: React.FC<TextElementRendererProps> = ({
  element,
  onSelect,
}) => {
  const textRef = useRef<Konva.Text | null>(null);
  const groupRef = useRef<Konva.Group | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [textWidth, setTextWidth] = useState(200);
  const trRef = useRef<Konva.Transformer | null>(null);

  useEffect(() => {
    if (trRef.current && textRef.current) {
      // nodes expects non-null Konva.Node[]; we've guarded above
      trRef.current.nodes([textRef.current as Konva.Node]);
    }
  }, [isEditing]);

  const { updateElement } = useCanvasStore();

  const handleDragEnd = () => {
    const g = groupRef.current;
    if (!g) return;

    updateElement(element.id, {
      transform: {
        ...element.transform,
        x: g.x(),
        y: g.y(),
      },
    });
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleTextChange = useCallback(
    (text: string) => {
      updateElement(element.id, { text });
    },
    [element.id, updateElement]
  );

  const handleEditingEnd = () => {
    setIsEditing(false);
  };

  const handleTextDblClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleTransform = useCallback(() => {
    const node = textRef.current;
    if (!node) return;
    const scaleX = node.scaleX();
    const newWidth = node.width() * scaleX;
    setTextWidth(newWidth);
    node.setAttrs({
      width: newWidth,
      scaleX: 1,
    });
  }, []);

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

  return (
    <Group
      ref={groupRef}
      x={transform.x}
      y={transform.y}
      scaleX={transform.scaleX}
      scaleY={transform.scaleY}
      rotation={transform.rotation}
      opacity={element.opacity}
      draggable={!element.locked && !isEditing && !isInGroup} // Don't allow dragging when in group
      onDragEnd={handleDragEnd}
      onClick={onSelect}
      onDblClick={handleDoubleClick}
    >
      {/* <Text
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
      /> */}

      <Text
        ref={textRef}
        text={element.text}
        x={50}
        y={80}
        fontSize={20}
        draggable
        width={textWidth}
        onDblClick={handleTextDblClick}
        onDblTap={handleTextDblClick}
        onTransform={handleTransform}
        visible={!isEditing}
      />

      {isEditing && (
        <TextEditor
          textNode={textRef.current}
          onChange={handleTextChange}
          onClose={() => setIsEditing(false)}
        />
      )}
      {!isEditing && (
        <Transformer
          ref={trRef}
          enabledAnchors={['middle-left', 'middle-right']}
          boundBoxFunc={(oldBox, newBox) => ({
            ...newBox,
            width: Math.max(30, newBox.width),
          })}
        />
      )}
    </Group>
  );
};

const TextEditor = ({
  textNode,
  onClose,
  onChange,
}: {
  textNode: Konva.Text | null;
  onClose: () => void;
  onChange: (text: string) => void;
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!textareaRef.current || !textNode) return;

    const textarea = textareaRef.current;
    const textPosition = textNode.position();
    const areaPosition = {
      x: textPosition.x,
      y: textPosition.y,
    };

    // Match styles with the text node
    textarea.value = textNode.text();
    textarea.style.position = 'absolute';
    textarea.style.top = `${areaPosition.y}px`;
    textarea.style.left = `${areaPosition.x}px`;
    textarea.style.width = `${textNode.width() - textNode.padding() * 2}px`;
    textarea.style.height = `${textNode.height() - textNode.padding() * 2 + 5}px`;
    textarea.style.fontSize = `${textNode.fontSize()}px`;
    textarea.style.border = 'none';
    textarea.style.padding = '0px';
    textarea.style.margin = '0px';
    textarea.style.overflow = 'hidden';
    textarea.style.background = 'none';
    textarea.style.outline = 'none';
    textarea.style.resize = 'none';
    textarea.style.lineHeight = textNode.lineHeight().toString();
    textarea.style.fontFamily = textNode.fontFamily();
    textarea.style.transformOrigin = 'left top';
    textarea.style.textAlign = textNode.align();
    // coerce fill to string safely
    textarea.style.color = String(textNode.fill());

    const rotation = textNode.rotation();
    let transform = '';
    if (rotation) {
      transform += `rotateZ(${rotation}deg)`;
    }
    textarea.style.transform = transform;

    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight + 3}px`;

    textarea.focus();

    const handleOutsideClick = (e: MouseEvent) => {
      // compare EventTarget to textarea reference
      if (e.target !== textarea) {
        onChange(textarea.value);
        onClose();
      }
    };

    // Add event listeners
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e as KeyboardEvent).key === 'Enter' &&
        !(e as KeyboardEvent).shiftKey
      ) {
        e.preventDefault();
        onChange(textarea.value);
        onClose();
      }
      if ((e as KeyboardEvent).key === 'Escape') {
        onClose();
      }
    };

    const handleInput = () => {
      const scale = textNode.getAbsoluteScale().x;
      textarea.style.width = `${textNode.width() * scale}px`;
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight + textNode.fontSize()}px`;
    };

    textarea.addEventListener('keydown', handleKeyDown as any);
    textarea.addEventListener('input', handleInput as any);
    // delay adding the global click handler so the focus and immediate clicks don't close it
    const t = setTimeout(() => {
      window.addEventListener('click', handleOutsideClick);
    });

    return () => {
      textarea.removeEventListener('keydown', handleKeyDown as any);
      textarea.removeEventListener('input', handleInput as any);
      window.removeEventListener('click', handleOutsideClick);
      clearTimeout(t);
    };
  }, [textNode, onChange, onClose]);

  return (
    <Html>
      <textarea
        ref={textareaRef}
        style={{
          minHeight: '1em',
          position: 'absolute',
        }}
      />
    </Html>
  );
};
