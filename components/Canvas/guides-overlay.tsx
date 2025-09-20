'use client';

import React from 'react';
import { Group, Line } from 'react-konva';
import { useCanvasStore } from '../../store/canvas-store';

interface GuidesOverlayProps {
  selectedIds: string[];
}

export const GuidesOverlay: React.FC<GuidesOverlayProps> = ({ selectedIds }) => {
  const { elements, width: canvasWidth, height: canvasHeight, zoom } = useCanvasStore();
  
  if (selectedIds.length === 0) return null;

  const selectedElements = selectedIds
    .map(id => elements.find(el => el.id === id))
    .filter(Boolean);

  if (selectedElements.length === 0) return null;

  const guides: React.ReactElement[] = [];
  const snapThreshold = 5;

  // Get bounds of selected elements
  const selectedBounds = selectedElements.reduce((bounds, element) => {
    if (!element) return bounds;
    
    const { x, y } = element.transform;
    // For simplicity, assuming basic width/height - in real implementation,
    // you'd calculate actual bounds considering rotation, scale, etc.
    const width = 100; // Default width
    const height = 50; // Default height
    
    return {
      left: Math.min(bounds.left, x),
      right: Math.max(bounds.right, x + width),
      top: Math.min(bounds.top, y),
      bottom: Math.max(bounds.bottom, y + height),
      centerX: x + width / 2,
      centerY: y + height / 2
    };
  }, {
    left: Infinity,
    right: -Infinity,
    top: Infinity,
    bottom: -Infinity,
    centerX: 0,
    centerY: 0
  });

  // Check for alignment with other elements
  elements.forEach(element => {
    if (selectedIds.includes(element.id)) return;

    const { x, y } = element.transform;
    const width = 100; // Default width
    const height = 50; // Default height
    
    const elementBounds = {
      left: x,
      right: x + width,
      top: y,
      bottom: y + height,
      centerX: x + width / 2,
      centerY: y + height / 2
    };

    // Vertical alignment guides
    if (Math.abs(selectedBounds.left - elementBounds.left) < snapThreshold) {
      guides.push(
        <Line
          key={`guide-v-left-${element.id}`}
          points={[elementBounds.left, 0, elementBounds.left, canvasHeight]}
          stroke="#ff6b6b"
          strokeWidth={1 / zoom}
          dash={[5 / zoom, 5 / zoom]}
          listening={false}
        />
      );
    }

    if (Math.abs(selectedBounds.right - elementBounds.right) < snapThreshold) {
      guides.push(
        <Line
          key={`guide-v-right-${element.id}`}
          points={[elementBounds.right, 0, elementBounds.right, canvasHeight]}
          stroke="#ff6b6b"
          strokeWidth={1 / zoom}
          dash={[5 / zoom, 5 / zoom]}
          listening={false}
        />
      );
    }

    if (Math.abs(selectedBounds.centerX - elementBounds.centerX) < snapThreshold) {
      guides.push(
        <Line
          key={`guide-v-center-${element.id}`}
          points={[elementBounds.centerX, 0, elementBounds.centerX, canvasHeight]}
          stroke="#ff6b6b"
          strokeWidth={1 / zoom}
          dash={[5 / zoom, 5 / zoom]}
          listening={false}
        />
      );
    }

    // Horizontal alignment guides
    if (Math.abs(selectedBounds.top - elementBounds.top) < snapThreshold) {
      guides.push(
        <Line
          key={`guide-h-top-${element.id}`}
          points={[0, elementBounds.top, canvasWidth, elementBounds.top]}
          stroke="#ff6b6b"
          strokeWidth={1 / zoom}
          dash={[5 / zoom, 5 / zoom]}
          listening={false}
        />
      );
    }

    if (Math.abs(selectedBounds.bottom - elementBounds.bottom) < snapThreshold) {
      guides.push(
        <Line
          key={`guide-h-bottom-${element.id}`}
          points={[0, elementBounds.bottom, canvasWidth, elementBounds.bottom]}
          stroke="#ff6b6b"
          strokeWidth={1 / zoom}
          dash={[5 / zoom, 5 / zoom]}
          listening={false}
        />
      );
    }

    if (Math.abs(selectedBounds.centerY - elementBounds.centerY) < snapThreshold) {
      guides.push(
        <Line
          key={`guide-h-center-${element.id}`}
          points={[0, elementBounds.centerY, canvasWidth, elementBounds.centerY]}
          stroke="#ff6b6b"
          strokeWidth={1 / zoom}
          dash={[5 / zoom, 5 / zoom]}
          listening={false}
        />
      );
    }
  });

  // Canvas center guides
  const canvasCenterX = canvasWidth / 2;
  const canvasCenterY = canvasHeight / 2;

  if (Math.abs(selectedBounds.centerX - canvasCenterX) < snapThreshold) {
    guides.push(
      <Line
        key="guide-canvas-center-x"
        points={[canvasCenterX, 0, canvasCenterX, canvasHeight]}
        stroke="#4ecdc4"
        strokeWidth={1 / zoom}
        dash={[5 / zoom, 5 / zoom]}
        listening={false}
      />
    );
  }

  if (Math.abs(selectedBounds.centerY - canvasCenterY) < snapThreshold) {
    guides.push(
      <Line
        key="guide-canvas-center-y"
        points={[0, canvasCenterY, canvasWidth, canvasCenterY]}
        stroke="#4ecdc4"
        strokeWidth={1 / zoom}
        dash={[5 / zoom, 5 / zoom]}
        listening={false}
      />
    );
  }

  return <Group>{guides}</Group>;
};