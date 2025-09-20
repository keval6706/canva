'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Transformer } from 'react-konva';
import Konva from 'konva';
import { useCanvasStore } from '../../store/canvasStore';

interface TransformerOverlayProps {
  selectedIds: string[];
}

export const TransformerOverlay: React.FC<TransformerOverlayProps> = ({ selectedIds }) => {
  const transformerRef = useRef<Konva.Transformer>(null);
  const [isProportionalScaling, setIsProportionalScaling] = useState(false);
  const { elements, updateElement } = useCanvasStore();

  useEffect(() => {
    if (!transformerRef.current) return;

    const transformer = transformerRef.current;
    const stage = transformer.getStage();
    if (!stage) return;

    if (selectedIds.length === 0) {
      transformer.nodes([]);
      return;
    }

    // Find the selected element nodes in the stage
    const selectedNodes: Konva.Node[] = [];
    
    selectedIds.forEach(id => {
      // Find the group node for this element by traversing the stage
      const elementNode = stage.findOne(`#element-${id}`);
      if (elementNode) {
        // Ensure the node has correct initial scale (should be 1)
        elementNode.scaleX(1);
        elementNode.scaleY(1);
        selectedNodes.push(elementNode);
      }
    });

    if (selectedNodes.length > 0) {
      transformer.nodes(selectedNodes);
      transformer.getLayer()?.batchDraw();
    } else {
      transformer.nodes([]);
    }
  }, [selectedIds]); // Keep original dependencies

  const handleTransform = (e: Konva.KonvaEventObject<Event>) => {
    const transformer = transformerRef.current;
    if (!transformer) return;

    const nodes = transformer.nodes();
    
    // Check if shift key is pressed for proportional scaling
    const isShiftPressed = e.evt && (e.evt as any).shiftKey;
    setIsProportionalScaling(isShiftPressed);
    
    nodes.forEach((node) => {
      let scaleX = node.scaleX();
      let scaleY = node.scaleY();
      
      // If shift is pressed, maintain aspect ratio
      if (isShiftPressed) {
        // Calculate the smaller absolute scale to maintain aspect ratio
        const absScaleX = Math.abs(scaleX);
        const absScaleY = Math.abs(scaleY);
        const uniformScale = Math.min(absScaleX, absScaleY);
        
        // Preserve sign of the scale
        const signX = scaleX >= 0 ? 1 : -1;
        const signY = scaleY >= 0 ? 1 : -1;
        
        scaleX = uniformScale * signX;
        scaleY = uniformScale * signY;
        
        node.scaleX(scaleX);
        node.scaleY(scaleY);
      }
      
      // Clamp scale values to prevent extreme scaling
      const finalScaleX = node.scaleX();
      const finalScaleY = node.scaleY();
      
      const clampedScaleX = Math.max(0.1, Math.min(10, Math.abs(finalScaleX))) * (finalScaleX >= 0 ? 1 : -1);
      const clampedScaleY = Math.max(0.1, Math.min(10, Math.abs(finalScaleY))) * (finalScaleY >= 0 ? 1 : -1);
      
      if (Math.abs(finalScaleX) < 0.1 || Math.abs(finalScaleX) > 10) {
        node.scaleX(clampedScaleX);
      }
      if (Math.abs(finalScaleY) < 0.1 || Math.abs(finalScaleY) > 10) {
        node.scaleY(clampedScaleY);
      }
    });
  };

  const handleTransformEnd = (e: Konva.KonvaEventObject<Event>) => {
    const transformer = transformerRef.current;
    if (!transformer) return;

    const nodes = transformer.nodes();
    
    // Check if shift key was pressed during transform
    const wasShiftPressed = e.evt && (e.evt as any).shiftKey;
    
    // Reset proportional scaling state
    setIsProportionalScaling(false);
    
    nodes.forEach((node) => {
      // Extract element ID from node name
      const elementId = node.name().replace('element-', '');
      if (!elementId) return;

      const element = elements.find(el => el.id === elementId);
      if (!element) return;

      const scaleX = node.scaleX();
      const scaleY = node.scaleY();

      // Debug logging
      console.log(`Transform end - Element: ${elementId}, ScaleX: ${scaleX}, ScaleY: ${scaleY}, Shift: ${wasShiftPressed}`);

      // Validate scale values to prevent extreme scaling
      const clampedScaleX = Math.max(0.1, Math.min(10, Math.abs(scaleX))) * (scaleX >= 0 ? 1 : -1);
      const clampedScaleY = Math.max(0.1, Math.min(10, Math.abs(scaleY))) * (scaleY >= 0 ? 1 : -1);

      // Handle different element types differently
      if (element.type === 'text') {
        // For text elements, update fontSize and dimensions instead of scale
        const textElement = element as any; // Cast to access text properties
        const currentFontSize = textElement.fontSize || 24;
        
        // Use the average scale for font size if shift was pressed (proportional)
        const fontScale = wasShiftPressed ? 
          (Math.abs(clampedScaleX) + Math.abs(clampedScaleY)) / 2 : 
          Math.abs(clampedScaleY);
          
        const newFontSize = Math.max(8, Math.min(200, currentFontSize * fontScale));
        
        updateElement(elementId, {
          fontSize: newFontSize,
          width: textElement.width ? Math.max(10, textElement.width * Math.abs(clampedScaleX)) : undefined,
          height: textElement.height ? Math.max(10, textElement.height * Math.abs(clampedScaleY)) : undefined,
          transform: {
            ...element.transform,
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
            // Keep scale at 1 for text elements
            scaleX: 1,
            scaleY: 1,
          },
        });
      } else {
        // For other elements, use scale transforms with validation
        const newScaleX = Math.max(0.1, Math.min(10, element.transform.scaleX * clampedScaleX));
        const newScaleY = Math.max(0.1, Math.min(10, element.transform.scaleY * clampedScaleY));
        
        updateElement(elementId, {
          transform: {
            ...element.transform,
            x: node.x(),
            y: node.y(),
            scaleX: newScaleX,
            scaleY: newScaleY,
            rotation: node.rotation(),
          },
        });
      }

      // Reset the node scale AFTER updating the element to prevent timing issues
      node.scaleX(1);
      node.scaleY(1);
    });

    // Force transformer to update its bounds after a short delay
    setTimeout(() => {
      if (transformer && transformer.getLayer()) {
        transformer.getLayer()?.batchDraw();
        transformer.forceUpdate();
      }
    }, 10);
  };

  if (selectedIds.length === 0) {
    return null;
  }

  return (
    <Transformer
      ref={transformerRef}
      boundBoxFunc={(oldBox, newBox) => {
        // Prevent elements from being scaled too small or too large
        const minWidth = 10;
        const minHeight = 10;
        const maxWidth = 2000;
        const maxHeight = 2000;
        
        if (newBox.width < minWidth || newBox.height < minHeight) {
          return oldBox;
        }
        
        if (newBox.width > maxWidth || newBox.height > maxHeight) {
          return oldBox;
        }
        
        return newBox;
      }}
      onTransform={handleTransform}
      onTransformEnd={handleTransformEnd}
      keepRatio={false}
      centeredScaling={false}
      enabledAnchors={[
        'top-left',
        'top-center', 
        'top-right',
        'middle-right',
        'bottom-right',
        'bottom-center',
        'bottom-left',
        'middle-left'
      ]}
      borderEnabled={true}
      borderStroke={isProportionalScaling ? "#ff6b6b" : "#0066ff"}
      borderStrokeWidth={isProportionalScaling ? 2 : 1}
      borderDash={isProportionalScaling ? [2, 2] : [3, 3]}
      anchorFill="white"
      anchorStroke={isProportionalScaling ? "#ff6b6b" : "#0066ff"}
      anchorStrokeWidth={1}
      anchorSize={8}
      anchorCornerRadius={2}
    />
  );
};