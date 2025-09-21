'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import Konva from 'konva';
import { Group } from 'react-konva';
import { CanvasElement } from '../../types/canvas';
import { CanvasElementRenderer } from './canvas-element-renderer';
import { useCanvasStore } from '../../store/canvas-store';

interface ClippedCanvasElementProps {
  element: CanvasElement;
  onSelect: (e: Konva.KonvaEventObject<MouseEvent>) => void;
  canvasWidth: number;
  canvasHeight: number;
}

export const ClippedCanvasElement: React.FC<ClippedCanvasElementProps> = ({
  element,
  onSelect,
  canvasWidth,
  canvasHeight,
}) => {
  const outsideGroupRef = useRef<Konva.Group>(null);
  const insideGroupRef = useRef<Konva.Group>(null);
  const { updateElement } = useCanvasStore();

  // Handle drag events
  const handleDragMove = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    const { x, y } = e.target.position();

    // Sync positions between inside and outside groups
    if (outsideGroupRef.current && insideGroupRef.current) {
      outsideGroupRef.current.position({ x, y });
      insideGroupRef.current.position({ x, y });
    }
  }, []);

  const handleDragEnd = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      const { x, y } = e.target.position();

      // Update element in store
      updateElement(element.id, {
        transform: {
          ...element.transform,
          x,
          y,
        },
      });
    },
    [element.id, element.transform, updateElement]
  );

  // Apply transforms when element updates
  useEffect(() => {
    [outsideGroupRef, insideGroupRef].forEach((ref) => {
      const group = ref.current;
      if (!group) return;

      group.position({
        x: element.transform.x,
        y: element.transform.y,
      });
      group.scale({
        x: element.transform.scaleX,
        y: element.transform.scaleY,
      });
      group.rotation(element.transform.rotation);
      group.opacity(element.opacity);
      group.visible(element.visible);
    });
  }, [element]);

  return (
    <>
      {/* Outside element with reduced opacity */}
      <Group
        ref={outsideGroupRef}
        opacity={0.3}
        listening={false} // Don't handle events
      >
        <CanvasElementRenderer element={element} onSelect={() => {}} />
      </Group>

      {/* Inside element (clipped) with full opacity and interactivity */}
      <Group
        ref={insideGroupRef}
        draggable={!element.locked}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        listening={true}
      >
        <CanvasElementRenderer element={element} onSelect={onSelect} />
      </Group>
    </>
  );
};
