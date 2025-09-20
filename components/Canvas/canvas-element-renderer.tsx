'use client';

import React from 'react';
import Konva from 'konva';
import {
  CanvasElement,
  TextElement,
  ImageElement,
  ShapeElement,
  BackgroundElement,
  StickerElement,
  DrawingElement,
  GroupElement,
} from '../../types/canvas';
import { TextElementRenderer } from './elements/text-element-renderer';
import { ImageElementRenderer } from './elements/image-element-renderer';
import { ShapeElementRenderer } from './elements/shape-element-renderer';
import { BackgroundElementRenderer } from './elements/background-element-renderer';
import { StickerElementRenderer } from './elements/sticker-element-renderer';
import { DrawingElementRenderer } from './elements/drawing-element-renderer';
import { GroupElementRenderer } from './elements/group-element-renderer';

interface CanvasElementRendererProps {
  element: CanvasElement;
  onSelect: (e: Konva.KonvaEventObject<MouseEvent>) => void;
}

export const CanvasElementRenderer: React.FC<CanvasElementRendererProps> = ({
  element,
  onSelect,
}) => {
  switch (element.type) {
    case 'text':
      return (
        <TextElementRenderer
          element={element as TextElement}
          onSelect={onSelect}
        />
      );
    case 'image':
      return (
        <ImageElementRenderer
          element={element as ImageElement}
          onSelect={onSelect}
        />
      );
    case 'shape':
      return (
        <ShapeElementRenderer
          element={element as ShapeElement}
          onSelect={onSelect}
        />
      );
    case 'background':
      return (
        <BackgroundElementRenderer
          element={element as BackgroundElement}
          onSelect={onSelect}
        />
      );
    case 'sticker':
      return (
        <StickerElementRenderer
          element={element as StickerElement}
          onSelect={onSelect}
        />
      );
    case 'drawing':
      return (
        <DrawingElementRenderer
          element={element as DrawingElement}
          onSelect={onSelect}
        />
      );
    case 'group':
      return (
        <GroupElementRenderer
          element={element as GroupElement}
          onSelect={onSelect}
        />
      );
    default:
      return null;
  }
};
