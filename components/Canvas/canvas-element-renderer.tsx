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
  ElementType,
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
    case ElementType.TEXT:
      return (
        <TextElementRenderer
          element={element as TextElement}
          onSelect={onSelect}
        />
      );
    case ElementType.IMAGE:
      return (
        <ImageElementRenderer
          element={element as ImageElement}
          onSelect={onSelect}
        />
      );
    case ElementType.SHAPE:
      return (
        <ShapeElementRenderer
          element={element as ShapeElement}
          onSelect={onSelect}
        />
      );
    case ElementType.BACKGROUND:
      return (
        <BackgroundElementRenderer
          element={element as BackgroundElement}
          onSelect={onSelect}
        />
      );
    case ElementType.STICKER:
      return (
        <StickerElementRenderer
          element={element as StickerElement}
          onSelect={onSelect}
        />
      );
    case ElementType.DRAWING:
      return (
        <DrawingElementRenderer
          element={element as DrawingElement}
          onSelect={onSelect}
        />
      );
    case ElementType.GROUP:
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
