'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Rect, Group, Image as KonvaImage } from 'react-konva';
import Konva from 'konva';
import { BackgroundElement } from '../../../types/canvas';
import { useCanvasStore } from '../../../store/canvasStore';

interface BackgroundElementRendererProps {
  element: BackgroundElement;
  isSelected: boolean;
  onSelect: (e: Konva.KonvaEventObject<MouseEvent>) => void;
}

export const BackgroundElementRenderer: React.FC<BackgroundElementRendererProps> = ({
  element,
  onSelect,
}) => {
  const rectRef = useRef<Konva.Rect>(null);
  const imageRef = useRef<Konva.Image>(null);
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);
  
  const { width: canvasWidth, height: canvasHeight } = useCanvasStore();

  // Load background image if needed
  useEffect(() => {
    if (element.backgroundType === 'image' && element.image?.src) {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        setBackgroundImage(img);
      };
      
      img.onerror = () => {
        console.error('Failed to load background image:', element.image?.src);
      };
      
      img.src = element.image.src;
    } else {
      setBackgroundImage(null);
    }
  }, [element.backgroundType, element.image?.src]);

  if (!element.visible) return null;

  const renderBackground = () => {
    switch (element.backgroundType) {
      case 'color':
        return (
          <Rect
            ref={rectRef}
            x={0}
            y={0}
            width={canvasWidth}
            height={canvasHeight}
            fill={element.color || '#ffffff'}
            listening={false}
          />
        );

      case 'gradient':
        if (!element.gradient) return null;
        
        const canvas = document.createElement('canvas');
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          let gradient;
          
          if (element.gradient.type === 'linear') {
            const angle = (element.gradient.angle || 0) * Math.PI / 180;
            const x1 = Math.cos(angle) * canvasWidth / 2 + canvasWidth / 2;
            const y1 = Math.sin(angle) * canvasHeight / 2 + canvasHeight / 2;
            const x2 = canvasWidth - x1;
            const y2 = canvasHeight - y1;
            
            gradient = ctx.createLinearGradient(x1, y1, x2, y2);
          } else {
            gradient = ctx.createRadialGradient(
              canvasWidth / 2, canvasHeight / 2, 0,
              canvasWidth / 2, canvasHeight / 2, Math.max(canvasWidth, canvasHeight) / 2
            );
          }
          
          element.gradient.colorStops.forEach(stop => {
            gradient.addColorStop(stop.offset, stop.color);
          });
          
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        }
        
        return (
          <KonvaImage
            ref={imageRef}
            image={canvas}
            x={0}
            y={0}
            width={canvasWidth}
            height={canvasHeight}
            listening={false}
          />
        );

      case 'image':
        if (!backgroundImage || !element.image) return null;
        
        let imageX = 0;
        let imageY = 0;
        let imageWidth = backgroundImage.naturalWidth;
        let imageHeight = backgroundImage.naturalHeight;
        
        switch (element.image.scale) {
          case 'cover':
            const scale = Math.max(canvasWidth / imageWidth, canvasHeight / imageHeight);
            imageWidth *= scale;
            imageHeight *= scale;
            imageX = (canvasWidth - imageWidth) / 2;
            imageY = (canvasHeight - imageHeight) / 2;
            break;
            
          case 'contain':
            const containScale = Math.min(canvasWidth / imageWidth, canvasHeight / imageHeight);
            imageWidth *= containScale;
            imageHeight *= containScale;
            imageX = (canvasWidth - imageWidth) / 2;
            imageY = (canvasHeight - imageHeight) / 2;
            break;
            
          case 'fill':
            imageWidth = canvasWidth;
            imageHeight = canvasHeight;
            break;
            
          case 'none':
          default:
            imageX = element.image.position?.x || 0;
            imageY = element.image.position?.y || 0;
            break;
        }
        
        return (
          <KonvaImage
            ref={imageRef}
            image={backgroundImage}
            x={imageX}
            y={imageY}
            width={imageWidth}
            height={imageHeight}
            listening={false}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Group
      x={element.transform.x}
      y={element.transform.y}
      scaleX={element.transform.scaleX}
      scaleY={element.transform.scaleY}
      rotation={element.transform.rotation}
      opacity={element.opacity}
      onClick={onSelect}
    >
      {renderBackground()}
    </Group>
  );
};