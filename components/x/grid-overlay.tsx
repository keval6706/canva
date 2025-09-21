"use client";

import React from "react";
import { Group, Line } from "react-konva";

interface GridOverlayProps {
  width: number;
  height: number;
  gridSize: number;
  zoom: number;
}

export const GridOverlay: React.FC<GridOverlayProps> = ({
  width,
  height,
  gridSize,
  zoom,
}) => {
  const lines: React.ReactElement[] = [];
  const effectiveGridSize = gridSize * zoom;

  // Only show grid if it's not too small when zoomed out
  if (effectiveGridSize < 5) return null;

  // Vertical lines
  for (let i = 0; i <= width; i += gridSize) {
    lines.push(
      <Line
        key={`v-${i}`}
        points={[i, 0, i, height]}
        stroke="rgba(0,0,0,0.1)"
        strokeWidth={1 / zoom}
        listening={false}
      />,
    );
  }

  // Horizontal lines
  for (let i = 0; i <= height; i += gridSize) {
    lines.push(
      <Line
        key={`h-${i}`}
        points={[0, i, width, i]}
        stroke="rgba(0,0,0,0.1)"
        strokeWidth={1 / zoom}
        listening={false}
      />,
    );
  }

  return <Group>{lines}</Group>;
};
