'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Stage, Layer, Rect, Line } from 'react-konva';
import Konva from 'konva';
import { useCanvasStore } from '../../store/canvas-store';
import { CanvasElementRenderer } from './canvas-element-renderer';
import { TransformerOverlay } from './transformer-overlay';
import { GridOverlay } from './grid-overlay';
import { GuidesOverlay } from './guides-overlay';

interface CanvasProps {
  width: number;
  height: number;
  className?: string;
}

export const Canvas: React.FC<CanvasProps> = ({ width, height, className }) => {
  const stageRef = useRef<Konva.Stage>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<number[]>([]);

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
    setPan,
    selectElement,
    selectElements,
    clearSelection,
    addElement,
    groupElements,
    ungroupElements,
    undo,
    redo,
    copyElements,
    cutElements,
    pasteElements,
    duplicateElements,
    deleteElements,
    selectAll,
  } = useCanvasStore();

  // Handle stage drag (panning)
  const handleStageDragStart = useCallback(
    (_e: Konva.KonvaEventObject<DragEvent>) => {
      if (tool !== 'pan' && tool !== 'select') return;

      setIsDragging(true);
    },
    [tool]
  );

  const handleStageDragMove = useCallback(
    (e: Konva.KonvaEventObject<DragEvent>) => {
      if (!isDragging || (tool !== 'pan' && tool !== 'select')) return;

      const stage = e.target.getStage();
      if (stage) {
        setPan({ x: stage.x(), y: stage.y() });
      }
    },
    [isDragging, tool, setPan]
  );

  const handleStageDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle click on empty area
  const handleStageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      // Check if clicked on empty area
      if (e.target === e.target.getStage()) {
        clearSelection();
      }
    },
    [clearSelection]
  );

  // Handle element selection
  const handleElementClick = useCallback(
    (elementId: string, e: Konva.KonvaEventObject<MouseEvent>) => {
      e.cancelBubble = true;

      if (e.evt.ctrlKey || e.evt.metaKey) {
        // Multi-select
        if (selectedIds.includes(elementId)) {
          selectElements(selectedIds.filter((id) => id !== elementId));
        } else {
          selectElements([...selectedIds, elementId]);
        }
      } else {
        selectElement(elementId);
      }
    },
    [selectedIds, selectElement, selectElements]
  );

  // Handle drawing
  const handleMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (tool !== 'brush') return;

      const stage = e.target.getStage();
      if (!stage) return;

      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const position = {
        x: (pointer.x - pan.x) / zoom,
        y: (pointer.y - pan.y) / zoom,
      };

      setIsDrawing(true);
      setCurrentPath([position.x, position.y]);
    },
    [tool, pan, zoom]
  );

  const handleMouseMove = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (!isDrawing || tool !== 'brush') return;

      const stage = e.target.getStage();
      if (!stage) return;

      const pointer = stage.getPointerPosition();
      if (!pointer) return;

      const position = {
        x: (pointer.x - pan.x) / zoom,
        y: (pointer.y - pan.y) / zoom,
      };

      setCurrentPath((prev) => [...prev, position.x, position.y]);
    },
    [isDrawing, tool, pan, zoom]
  );

  const handleMouseUp = useCallback(() => {
    if (!isDrawing || tool !== 'brush') return;

    if (currentPath.length >= 4) {
      // Need at least 2 points (4 coordinates)
      const drawingElement = {
        type: 'drawing' as const,
        name: 'Drawing',
        visible: true,
        locked: false,
        opacity: 1,
        transform: {
          x: 0,
          y: 0,
          scaleX: 1,
          scaleY: 1,
          rotation: 0,
        },
        points: currentPath,
        stroke: '#000000',
        strokeWidth: 2,
        lineCap: 'round' as const,
        lineJoin: 'round' as const,
        tension: 0,
      };

      addElement(drawingElement);
    }

    setIsDrawing(false);
    setCurrentPath([]);
  }, [isDrawing, tool, currentPath, addElement]);

  // Create new element based on tool
  const handleStageDoubleClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (tool === 'text') {
        const stage = e.target.getStage();
        if (!stage) return;

        const pointer = stage.getPointerPosition();
        if (!pointer) return;

        const position = {
          x: (pointer.x - pan.x) / zoom,
          y: (pointer.y - pan.y) / zoom,
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
            rotation: 0,
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
          wrap: 'word' as const,
        };

        addElement(newElement);
      }
    },
    [tool, pan, zoom, addElement]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts when not typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'z':
            if (e.shiftKey) {
              e.preventDefault();
              redo();
            } else {
              e.preventDefault();
              undo();
            }
            break;
          case 'y':
            e.preventDefault();
            redo();
            break;
          case 'c':
            e.preventDefault();
            copyElements();
            break;
          case 'v':
            e.preventDefault();
            pasteElements();
            break;
          case 'x':
            e.preventDefault();
            cutElements();
            break;
          case 'd':
            e.preventDefault();
            duplicateElements(selectedIds);
            break;
          case 'a':
            e.preventDefault();
            selectAll();
            break;
          case 'g':
            e.preventDefault();
            if (e.shiftKey) {
              // Ungroup (Ctrl+Shift+G)
              const groupIds = selectedIds.filter((id) => {
                const element = elements.find((el) => el.id === id);
                return element?.type === 'group';
              });
              groupIds.forEach((id) => ungroupElements(id));
            } else {
              // Group (Ctrl+G)
              if (selectedIds.length >= 2) {
                groupElements(selectedIds);
              }
            }
            break;
          case 'backspace':
          case 'delete':
            e.preventDefault();
            if (selectedIds.length > 0) {
              deleteElements(selectedIds);
            }
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedIds,
    elements,
    groupElements,
    ungroupElements,
    undo,
    redo,
    copyElements,
    pasteElements,
    cutElements,
    duplicateElements,
    selectAll,
    deleteElements,
  ]);

  // Update stage position and scale
  useEffect(() => {
    const stage = stageRef.current;
    if (stage) {
      stage.position(pan);
      stage.scale({ x: zoom, y: zoom });
    }
  }, [pan, zoom]);

  // Center canvas on mount and when viewport or canvas size changes
  useEffect(() => {
    const centerCanvas = () => {
      const centerX = (width - canvasWidth * zoom) / 2;
      const centerY = (height - canvasHeight * zoom) / 2;
      setPan({ x: centerX, y: centerY });
    };

    centerCanvas();
  }, [width, height, canvasWidth, canvasHeight, zoom, setPan]); // Sort elements by zIndex and filter out child elements (they're rendered by their parent groups)
  const sortedElements = [...elements]
    .filter((element) => element.groupId === undefined) // Only render elements that are not children of groups
    .sort((a, b) => a.zIndex - b.zIndex);

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
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
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
              onSelect={(e: Konva.KonvaEventObject<MouseEvent>) =>
                handleElementClick(element.id, e)
              }
            />
          ))}

          {/* Current drawing path */}
          {isDrawing && currentPath.length >= 4 && (
            <Line
              points={currentPath}
              stroke="#000000"
              strokeWidth={2}
              opacity={0.7}
              lineCap="round"
              lineJoin="round"
              tension={0}
              globalCompositeOperation="source-over"
            />
          )}
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
