'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Image as KonvaImage, Group, Transformer } from 'react-konva';
import Konva from 'konva';
import { ImageElement } from '../../../types/canvas';
import { useCanvasStore } from '../../../store/canvasStore';

interface ImageElementRendererProps {
  element: ImageElement;
  isSelected: boolean;
  onSelect: (e: Konva.KonvaEventObject<MouseEvent>) => void;
}

export const ImageElementRenderer: React.FC<ImageElementRendererProps> = ({
  element,
  isSelected,
  onSelect,
}) => {
  const imageRef = useRef<Konva.Image>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const groupRef = useRef<Konva.Group>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  
  const { updateElement } = useCanvasStore();

  // Load image
  useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      setImage(img);
    };
    
    img.onerror = () => {
      console.error('Failed to load image:', element.src);
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

  const applyFilters = useCallback(() => {
    if (!element.filters || !imageRef.current) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filters: any[] = [];
    
    if (element.filters.brightness !== undefined && element.filters.brightness !== 0) {
      filters.push(Konva.Filters.Brighten);
    }
    
    if (element.filters.contrast !== undefined && element.filters.contrast !== 0) {
      filters.push(Konva.Filters.Contrast);
    }
    
    if (element.filters.blur !== undefined && element.filters.blur > 0) {
      filters.push(Konva.Filters.Blur);
    }
    
    if (element.filters.grayscale) {
      filters.push(Konva.Filters.Grayscale);
    }
    
    if (element.filters.sepia) {
      filters.push(Konva.Filters.Sepia);
    }
    
    if (element.filters.invert) {
      filters.push(Konva.Filters.Invert);
    }

    imageRef.current.filters(filters);
    imageRef.current.cache();
  }, [element.filters]);

  useEffect(() => {
    applyFilters();
  }, [element.filters, applyFilters]);

  if (!element.visible || !image) return null;

  const imageWidth = image.naturalWidth;
  const imageHeight = image.naturalHeight;
  
  // Calculate crop dimensions
  const cropWidth = element.cropWidth || imageWidth;
  const cropHeight = element.cropHeight || imageHeight;
  const cropX = element.cropX || 0;
  const cropY = element.cropY || 0;

  return (
    <Group
      ref={groupRef}
      x={element.transform.x}
      y={element.transform.y}
      scaleX={element.transform.scaleX * (element.flipX ? -1 : 1)}
      scaleY={element.transform.scaleY * (element.flipY ? -1 : 1)}
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
        width={cropWidth}
        height={cropHeight}
        cropX={cropX}
        cropY={cropY}
        cropWidth={cropWidth}
        cropHeight={cropHeight}
        brightness={element.filters?.brightness || 0}
        contrast={element.filters?.contrast || 0}
        blurRadius={element.filters?.blur || 0}
        saturation={element.filters?.saturation || 0}
        hue={element.filters?.hue || 0}
      />
      
      {isSelected && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            // Maintain aspect ratio when shift is held
            if (newBox.width < 20 || newBox.height < 20) {
              return oldBox;
            }
            return newBox;
          }}
          enabledAnchors={[
            'top-left',
            'top-right',
            'bottom-left',
            'bottom-right',
            'middle-left',
            'middle-right',
            'top-center',
            'bottom-center'
          ]}
        />
      )}
    </Group>
  );
};