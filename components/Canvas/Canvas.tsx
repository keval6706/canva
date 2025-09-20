'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Stage, Layer, Rect } from 'react-konva';
import Konva from 'konva';
import { useCanvasStore } from '../../store/canvasStore';
import { CanvasElementRenderer } from './CanvasElementRenderer';
import { TransformerOverlay } from './TransformerOverlay';
import { GridOverlay } from './GridOverlay';
import { GuidesOverlay } from './GuidesOverlay';

interface CanvasProps {
  width: number;
  height: number;
  className?: string;
}

export const Canvas: React.FC<CanvasProps> = ({ width, height, className }) => {
  const stageRef = useRef<Konva.Stage>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const {
    elements,
    selectedIds,
    zoom,
    pan,
    tool,
    grid,
    guides,
    width: canvasWidth,
    height: canvasHeight,
    setZoom,
    setPan,
    selectElement,
    selectElements,
    clearSelection,
    addElement
  } = useCanvasStore();

  // Handle stage drag (panning)
  const handleStageDragStart = useCallback((_e: Konva.KonvaEventObject<DragEvent>) => {
    if (tool !== 'pan' && tool !== 'select') return;
    
    setIsDragging(true);
  }, [tool]);

  const handleStageDragMove = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    if (!isDragging || (tool !== 'pan' && tool !== 'select')) return;
    
    const stage = e.target.getStage();
    if (stage) {
      setPan({ x: stage.x(), y: stage.y() });
    }
  }, [isDragging, tool, setPan]);

  const handleStageDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle click on empty area
  const handleStageClick = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    // Check if clicked on empty area
    if (e.target === e.target.getStage()) {
      clearSelection();
    }
  }, [clearSelection]);

  // Handle element selection
  const handleElementClick = useCallback((elementId: string, e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    
    if (e.evt.ctrlKey || e.evt.metaKey) {
      // Multi-select
      if (selectedIds.includes(elementId)) {
        selectElements(selectedIds.filter(id => id !== elementId));
      } else {
        selectElements([...selectedIds, elementId]);
      }
    } else {
      selectElement(elementId);
    }
  }, [selectedIds, selectElement, selectElements]);

  // Create new element based on tool
  const handleStageDoubleClick = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (tool === 'text') {
      const stage = e.target.getStage();
      if (!stage) return;
      
      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const position = {
        x: (pointer.x - pan.x) / zoom,
        y: (pointer.y - pan.y) / zoom
      };

            const newElement = {
        type: 'text' as const,
        name: 'Text',
        visible: true,
        locked: false,
        opacity: 1,
        transform: {
          x: position.x,
          y: position.y,
          scaleX: 1,
          scaleY: 1,
          rotation: 0
        },
        text: 'Double click to edit',
        fontSize: 24,
        fontFamily: 'Arial',
        fontWeight: 'normal' as const,
        fontStyle: 'normal' as const,
        textDecoration: 'none' as const,
        fill: '#000000',
        align: 'left' as const,
        verticalAlign: 'top' as const,
        lineHeight: 1.2,
        letterSpacing: 0,
        padding: 0,
        wrap: 'word' as const
      };

      addElement(newElement);
    }
  }, [tool, pan, zoom, addElement]);

  // Update stage position and scale
  useEffect(() => {
    const stage = stageRef.current;
    if (stage) {
      stage.position(pan);
      stage.scale({ x: zoom, y: zoom });
    }
  }, [pan, zoom]);

  // Sort elements by zIndex
  const sortedElements = [...elements].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div className={`relative overflow-hidden bg-gray-100 ${className}`}>
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        onDragStart={handleStageDragStart}
        onDragMove={handleStageDragMove}
        onDragEnd={handleStageDragEnd}
        onClick={handleStageClick}
        onDblClick={handleStageDoubleClick}
        draggable={tool === 'pan' || tool === 'select'}
      >
        {/* Grid Layer */}
        {grid.enabled && (
          <Layer>
            <GridOverlay
              width={canvasWidth}
              height={canvasHeight}
              gridSize={grid.size}
              zoom={zoom}
            />
          </Layer>
        )}

        {/* Canvas Background */}
        <Layer>
          <Rect
            x={0}
            y={0}
            width={canvasWidth}
            height={canvasHeight}
            fill="white"
            shadowColor="rgba(0,0,0,0.3)"
            shadowBlur={10}
            shadowOffset={{ x: 0, y: 2 }}
          />
        </Layer>

        {/* Elements Layer */}
        <Layer>
          {sortedElements.map((element) => (
            <CanvasElementRenderer
              key={element.id}
              element={element}
              isSelected={selectedIds.includes(element.id)}
              onSelect={(e: Konva.KonvaEventObject<MouseEvent>) => handleElementClick(element.id, e)}
            />
          ))}
        </Layer>

        {/* Selection/Transform Layer */}
        {selectedIds.length > 0 && (
          <Layer>
            <TransformerOverlay selectedIds={selectedIds} />
          </Layer>
        )}

        {/* Guides Layer */}
        {guides.enabled && (
          <Layer>
            <GuidesOverlay selectedIds={selectedIds} />
          </Layer>
        )}
      </Stage>
    </div>
  );
};