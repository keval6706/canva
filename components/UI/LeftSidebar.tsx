'use client';

import React, { useState } from 'react';
import { 
  CursorArrowRaysIcon,
  ChatBubbleBottomCenterTextIcon,
  PhotoIcon,
  Square3Stack3DIcon,
  SparklesIcon,
  DocumentDuplicateIcon,
  ArrowUpTrayIcon
} from '@heroicons/react/24/outline';
import { useCanvasStore } from '../../store/canvasStore';
import { Tool, CanvasElement, Template } from '../../types/canvas';
import { sampleTemplates, sampleStickers, sampleImages } from '../../data/sampleAssets';

interface ToolItem {
  id: Tool;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

const tools: ToolItem[] = [
  { id: 'select', name: 'Select', icon: CursorArrowRaysIcon },
  { id: 'text', name: 'Text', icon: ChatBubbleBottomCenterTextIcon },
  { id: 'image', name: 'Images', icon: PhotoIcon },
  { id: 'rectangle', name: 'Shapes', icon: Square3Stack3DIcon },
];

const assetTabs = [
  { id: 'templates', name: 'Templates', icon: DocumentDuplicateIcon },
  { id: 'stickers', name: 'Stickers', icon: SparklesIcon },
  { id: 'uploads', name: 'Uploads', icon: ArrowUpTrayIcon },
];

export const LeftSidebar: React.FC = () => {
    const { 
    tool,
    setTool, 
    addElement, 
    setCanvasSize 
  } = useCanvasStore();
  const [activeTab, setActiveTab] = useState<string>('tools');
  const [activeAssetTab, setActiveAssetTab] = useState<string>('templates');

  const handleToolSelect = (selectedTool: Tool) => {
    setTool(selectedTool);
  };

  const handleTemplateSelect = (template: Template) => {
    // Clear existing elements and add template elements
    setCanvasSize(template.width, template.height);
    
    // Add template elements
    template.elements.forEach((templateElement: CanvasElement) => {
      addElement(templateElement);
    });
  };

  const handleStickerSelect = (sticker: { id: string; name: string; src: string; category: string }) => {
    const stickerElement = {
      type: 'sticker' as const,
      name: sticker.name,
      visible: true,
      locked: false,
      opacity: 1,
      transform: {
        x: 100,
        y: 100,
        scaleX: 1,
        scaleY: 1,
        rotation: 0
      },
      src: sticker.src,
      category: sticker.category
    };
    
    addElement(stickerElement);
  };

  const handleAssetImageSelect = (image: { id: string; name: string; src: string }) => {
    const imageElement = {
      type: 'image' as const,
      name: image.name,
      visible: true,
      locked: false,
      opacity: 1,
      transform: {
        x: 100,
        y: 100,
        scaleX: 1,
        scaleY: 1,
        rotation: 0
      },
      src: image.src,
      cropX: 0,
      cropY: 0,
      cropWidth: 200,
      cropHeight: 200
    };
    
    addElement(imageElement);
  };

  const handleAddShape = (shapeType: string) => {
    const shapeElement = {
      type: 'shape' as const,
      name: `${shapeType.charAt(0).toUpperCase() + shapeType.slice(1)}`,
      visible: true,
      locked: false,
      opacity: 1,
      transform: {
        x: 100,
        y: 100,
        scaleX: 1,
        scaleY: 1,
        rotation: 0
      },
      shapeType: shapeType as 'rectangle' | 'circle' | 'triangle' | 'hexagon' | 'star' | 'line' | 'arrow',
      fill: '#3B82F6',
      stroke: '#1E40AF',
      strokeWidth: 2
    };
    
    addElement(shapeElement);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const src = e.target?.result as string;
      if (src) {
        const imageElement = {
          type: 'image' as const,
          name: file.name,
          visible: true,
          locked: false,
          opacity: 1,
          transform: {
            x: 100,
            y: 100,
            scaleX: 1,
            scaleY: 1,
            rotation: 0
          },
          src,
          cropX: 0,
          cropY: 0,
          cropWidth: 200,
          cropHeight: 200
        };
        
        addElement(imageElement);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('tools')}
          className={`flex-1 px-4 py-3 text-sm font-medium ${
            activeTab === 'tools'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Tools
        </button>
        <button
          onClick={() => setActiveTab('assets')}
          className={`flex-1 px-4 py-3 text-sm font-medium ${
            activeTab === 'assets'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Assets
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'tools' && (
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Tools</h3>
            <div className="space-y-2">
              {tools.map((toolItem) => (
                <button
                  key={toolItem.id}
                  onClick={() => handleToolSelect(toolItem.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left ${
                    tool === toolItem.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <toolItem.icon className="w-5 h-5" />
                  <span>{toolItem.name}</span>
                </button>
              ))}
            </div>

            {tool === 'rectangle' && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Shapes</h3>
                <div className="grid grid-cols-2 gap-2">
                  {['rectangle', 'circle', 'triangle', 'star'].map((shape) => (
                    <button
                      key={shape}
                      onClick={() => handleAddShape(shape)}
                      className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-center"
                    >
                      <div className="text-xs text-center">
                        {shape.charAt(0).toUpperCase() + shape.slice(1)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {tool === 'image' && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Add Image</h3>
                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <div className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 cursor-pointer text-center">
                    <PhotoIcon className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <div className="text-sm text-gray-600">
                      Click to upload image
                    </div>
                  </div>
                </label>
              </div>
            )}
          </div>
        )}

        {activeTab === 'assets' && (
          <div className="p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Asset Library</h3>
            
            {/* Asset tab navigation */}
            <div className="flex space-x-1 mb-4 bg-gray-100 rounded-lg p-1">
              {assetTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveAssetTab(tab.id)}
                  className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                    activeAssetTab === tab.id
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </div>

            {/* Templates */}
            {activeAssetTab === 'templates' && (
              <div className="space-y-3">
                <div className="text-xs text-gray-600 mb-2">Choose a template to get started</div>
                {sampleTemplates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                  >
                    <div className="flex items-center space-x-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={template.thumbnail}
                        alt={template.name}
                        className="w-12 h-12 rounded border"
                      />
                      <div>
                        <div className="font-medium text-sm text-gray-900">{template.name}</div>
                        <div className="text-xs text-gray-500">{template.category}</div>
                        <div className="text-xs text-gray-400">{template.width} × {template.height}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Stickers */}
            {activeAssetTab === 'stickers' && (
              <div className="space-y-3">
                <div className="text-xs text-gray-600 mb-2">Click to add stickers</div>
                <div className="grid grid-cols-4 gap-2">
                  {sampleStickers.map((sticker) => (
                    <div
                      key={sticker.id}
                      onClick={() => handleStickerSelect(sticker)}
                      className="aspect-square border border-gray-200 rounded-lg p-2 hover:bg-gray-50 cursor-pointer flex items-center justify-center"
                      title={sticker.name}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={sticker.src}
                        alt={sticker.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Uploads */}
            {activeAssetTab === 'uploads' && (
              <div className="space-y-3">
                <div className="text-xs text-gray-600 mb-2">Sample images</div>
                <div className="grid grid-cols-2 gap-2">
                  {sampleImages.map((image) => (
                    <div
                      key={image.id}
                      onClick={() => handleAssetImageSelect(image)}
                      className="aspect-square border border-gray-200 rounded-lg p-2 hover:bg-gray-50 cursor-pointer"
                      title={image.name}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image.src}
                        alt={image.name}
                        className="w-full h-full object-cover rounded"
                      />
                    </div>
                  ))}
                </div>
                
                <div className="mt-4">
                  <label className="block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <div className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 cursor-pointer text-center">
                      <PhotoIcon className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                      <div className="text-sm text-gray-600">
                        Upload your own image
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};