'use client';

import React from 'react';
import { LayersPanel } from './layers-panel';
import { PropertiesPanel } from './properties-panel';

export const RightSidebar: React.FC = () => {
  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
      {/* Properties Panel */}
      <div className="flex-1 border-b border-gray-200">
        <PropertiesPanel />
      </div>
      
      {/* Layers Panel */}
      <div className="h-80">
        <LayersPanel />
      </div>
    </div>
  );
};