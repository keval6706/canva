'use client';

import React, { useEffect, useRef } from 'react';
import { Canvas } from './Canvas/Canvas';
import { Toolbar } from './UI/Toolbar';
import { LeftSidebar } from './UI/LeftSidebar';
import { RightSidebar } from './UI/RightSidebar';
import { BottomBar } from './UI/BottomBar';
import { useCanvasStore } from '../store/canvasStore';

interface CanvasEditorProps {
  className?: string;
}

export const CanvasEditor: React.FC<CanvasEditorProps> = ({ className }) => {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const { 
    copyElements, 
    cutElements, 
    pasteElements, 
    deleteElements, 
    selectAll,
    undo,
    redo,
    selectedIds,
    duplicateElements
  } = useCanvasStore();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      
      // Prevent default browser shortcuts
      if (isCtrlOrCmd && ['z', 'y', 'c', 'v', 'x', 'a', 'd'].includes(e.key.toLowerCase())) {
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
  }, [copyElements, cutElements, pasteElements, deleteElements, selectAll, undo, redo, selectedIds, duplicateElements]);

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
            width={canvasContainerRef.current?.clientWidth || 800}
            height={canvasContainerRef.current?.clientHeight || 600}
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