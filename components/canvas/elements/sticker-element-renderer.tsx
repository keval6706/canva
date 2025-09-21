'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Image as KonvaImage, Group } from 'react-konva';
import Konva from 'konva';
import { StickerElement } from '../../../types/canvas';
import { useCanvasStore } from '../../../store/canvas-store';

interface StickerElementRendererProps {
  element: StickerElement;
  onSelect: (e: Konva.KonvaEventObject<MouseEvent>) => void;
}

export const StickerElementRenderer: React.FC<StickerElementRendererProps> = ({
  element,
  onSelect,
}) => {
  const imageRef = useRef<Konva.Image>(null);
  const groupRef = useRef<Konva.Group>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  const { updateElement } = useCanvasStore();

  // Load sticker image
  useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      setImage(img);
    };

    img.onerror = () => {
      console.error('Failed to load sticker:', element.src);
    };

    img.src = element.src;
  }, [element.src]);

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

  if (!element.visible || !image) return null;

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
      draggable={!element.locked && !isInGroup} // Don't allow dragging when in group
      onDragEnd={handleDragEnd}
      onClick={onSelect}
    >
      <KonvaImage
        ref={imageRef}
        image={image}
        x={0}
        y={0}
        width={image.naturalWidth}
        height={image.naturalHeight}
      />
    </Group>
  );
};
