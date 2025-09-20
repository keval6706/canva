'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Canvas } from './canvas/canvas';
import { Toolbar } from './ui/toolbar';
import { LeftSidebar } from './ui/left-sidebar';
import { RightSidebar } from './ui/right-sidebar';
import { BottomBar } from './ui/bottom-bar';
import { ExportModal } from './ui/export-modal';
import { useCanvasStore } from '../store/canvas-store';

interface CanvasEditorProps {
  className?: string;
}

export const CanvasEditor: React.FC<CanvasEditorProps> = ({ className }) => {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [viewportSize, setViewportSize] = useState({ width: 800, height: 600 });

  const {
    copyElements,
    cutElements,
    pasteElements,
    deleteElements,
    selectAll,
    undo,
    redo,
    selectedIds,
    duplicateElements,
  } = useCanvasStore();

  // Stable viewport sizing
  useEffect(() => {
    const updateViewportSize = () => {
      if (canvasContainerRef.current) {
        const { clientWidth, clientHeight } = canvasContainerRef.current;
        // Only update if the change is significant (more than 20px) to prevent constant re-renders
        if (
          Math.abs(clientWidth - viewportSize.width) > 20 ||
          Math.abs(clientHeight - viewportSize.height) > 20
        ) {
          setViewportSize({
            width: Math.max(clientWidth, 400), // Minimum viewport size
            height: Math.max(clientHeight, 300),
          });
        }
      }
    };

    // Initial size
    updateViewportSize();

    // Update on resize with debouncing
    let timeoutId: NodeJS.Timeout;
    const debouncedUpdate = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateViewportSize, 100);
    };

    const resizeObserver = new ResizeObserver(debouncedUpdate);
    if (canvasContainerRef.current) {
      resizeObserver.observe(canvasContainerRef.current);
    }

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
    };
  }, []); // Remove viewportSize from deps to prevent loops

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't interfere with input fields
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      // Prevent default browser shortcuts only when not in input fields
      if (
        isCtrlOrCmd &&
        ['z', 'y', 'c', 'v', 'x', 'a', 'd'].includes(e.key.toLowerCase())
      ) {
        e.preventDefault();
      }

      switch (e.key.toLowerCase()) {
        case 'z':
          if (isCtrlOrCmd && e.shiftKey) {
            redo();
          } else if (isCtrlOrCmd) {
            undo();
          }
          break;
        case 'y':
          if (isCtrlOrCmd) {
            redo();
          }
          break;
        case 'c':
          if (isCtrlOrCmd && selectedIds.length > 0) {
            copyElements();
          }
          break;
        case 'x':
          if (isCtrlOrCmd && selectedIds.length > 0) {
            cutElements();
          }
          break;
        case 'v':
          if (isCtrlOrCmd) {
            pasteElements();
          }
          break;
        case 'a':
          if (isCtrlOrCmd) {
            selectAll();
          }
          break;
        case 'd':
          if (isCtrlOrCmd && selectedIds.length > 0) {
            duplicateElements(selectedIds);
          }
          break;
        case 'delete':
        case 'backspace':
          if (selectedIds.length > 0) {
            deleteElements(selectedIds);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    copyElements,
    cutElements,
    pasteElements,
    deleteElements,
    selectAll,
    undo,
    redo,
    selectedIds,
    duplicateElements,
  ]);

  return (
    <div className={`flex flex-col h-screen bg-gray-50 ${className}`}>
      {/* Top Toolbar */}
      <Toolbar />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <LeftSidebar />

        {/* Canvas Area */}
        <div
          ref={canvasContainerRef}
          className="flex-1 flex items-center justify-center bg-gray-200 overflow-hidden"
        >
          <Canvas
            width={viewportSize.width}
            height={viewportSize.height}
            className="border border-gray-300 shadow-lg"
          />
        </div>

        {/* Right Sidebar */}
        <RightSidebar />
      </div>

      {/* Bottom Bar */}
      <BottomBar />
    </div>
  );
};
