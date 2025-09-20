'use client';

import React from 'react';
import Konva from 'konva';
import { CanvasElement, TextElement, ImageElement, ShapeElement, BackgroundElement, StickerElement, DrawingElement } from '../../types/canvas';
import { TextElementRenderer } from './elements/text-element-renderer';
import { ImageElementRenderer } from './elements/image-element-renderer';
import { ShapeElementRenderer } from './elements/shape-element-renderer';
import { BackgroundElementRenderer } from './elements/background-element-renderer';
import { StickerElementRenderer } from './elements/sticker-element-renderer';
import { DrawingElementRenderer } from './elements/drawing-element-renderer';

interface CanvasElementRendererProps {
  element: CanvasElement;
  isSelected: boolean;
  onSelect: (e: Konva.KonvaEventObject<MouseEvent>) => void;
}

export const CanvasElementRenderer: React.FC<CanvasElementRendererProps> = ({
  element,
  isSelected,
  onSelect,
}) => {
  switch (element.type) {
    case 'text':
      return <TextElementRenderer 
        element={element as TextElement} 
        isSelected={isSelected} 
        onSelect={onSelect} 
      />;
    case 'image':
      return <ImageElementRenderer 
        element={element as ImageElement} 
        isSelected={isSelected} 
        onSelect={onSelect} 
      />;
    case 'shape':
      return <ShapeElementRenderer 
        element={element as ShapeElement} 
        isSelected={isSelected} 
        onSelect={onSelect} 
      />;
    case 'background':
      return <BackgroundElementRenderer 
        element={element as BackgroundElement} 
        isSelected={isSelected} 
        onSelect={onSelect} 
      />;
    case 'sticker':
      return <StickerElementRenderer 
        element={element as StickerElement} 
        isSelected={isSelected} 
        onSelect={onSelect} 
      />;
    case 'drawing':
      return <DrawingElementRenderer 
        element={element as DrawingElement} 
        isSelected={isSelected} 
        onSelect={onSelect} 
      />;
    default:
      return null;
  }
};