'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Image as KonvaImage, Group, Transformer } from 'react-konva';
import Konva from 'konva';
import { StickerElement } from '../../../types/canvas';
import { useCanvasStore } from '../../../store/canvasStore';

interface StickerElementRendererProps {
  element: StickerElement;
  isSelected: boolean;
  onSelect: (e: Konva.KonvaEventObject<MouseEvent>) => void;
}

export const StickerElementRenderer: React.FC<StickerElementRendererProps> = ({
  element,
  isSelected,
  onSelect,
}) => {
  const imageRef = useRef<Konva.Image>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
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

  if (!element.visible || !image) return null;

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
      <KonvaImage
        ref={imageRef}
        image={image}
        x={0}
        y={0}
        width={image.naturalWidth}
        height={image.naturalHeight}
      />
      
      {isSelected && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            // Maintain aspect ratio and minimum size
            if (newBox.width < 20 || newBox.height < 20) {
              return oldBox;
            }
            return newBox;
          }}
          enabledAnchors={[
            'top-left',
            'top-right',
            'bottom-left',
            'bottom-right'
          ]}
        />
      )}
    </Group>
  );
};