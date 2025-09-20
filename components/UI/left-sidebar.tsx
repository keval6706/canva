'use client';

import React, { useState } from 'react';
import { 
  CursorArrowRaysIcon,
  ChatBubbleBottomCenterTextIcon,
  PhotoIcon,
  Square3Stack3DIcon
} from '@heroicons/react/24/outline';
import { useCanvasStore } from '../../store/canvas-store';
import { Tool, CanvasElement, Template } from '../../types/canvas';
import { sampleTemplates, sampleStickers, sampleImages } from '../../data/sample-assets';
import { Button } from './button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { Label } from './label';

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

export const LeftSidebar: React.FC = () => {
    const { 
    tool,
    setTool, 
    addElement, 
    setCanvasSize 
  } = useCanvasStore();

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
      <Tabs defaultValue="tools" className="flex flex-col h-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tools">Tools</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
        </TabsList>

        <TabsContent value="tools" className="flex-1 overflow-y-auto p-4">
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Tools</Label>
              <div className="space-y-2 mt-2">
                {tools.map((toolItem) => (
                  <Button
                    key={toolItem.id}
                    onClick={() => handleToolSelect(toolItem.id)}
                    variant={tool === toolItem.id ? "default" : "ghost"}
                    className="w-full justify-start"
                  >
                    <toolItem.icon className="w-5 h-5 mr-2" />
                    {toolItem.name}
                  </Button>
                ))}
              </div>
            </div>

            {tool === 'rectangle' && (
              <div>
                <Label className="text-sm font-medium">Shapes</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {['rectangle', 'circle', 'triangle', 'star'].map((shape) => (
                    <Button
                      key={shape}
                      onClick={() => handleAddShape(shape)}
                      variant="outline"
                      className="h-12"
                    >
                      {shape.charAt(0).toUpperCase() + shape.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {tool === 'image' && (
              <div>
                <Label className="text-sm font-medium">Add Image</Label>
                <label className="block mt-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button variant="outline" className="w-full h-20 flex-col">
                    <PhotoIcon className="w-8 h-8 mb-2" />
                    Click to upload image
                  </Button>
                </label>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="assets" className="flex-1 overflow-y-auto p-4">
          <Tabs defaultValue="templates" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="templates">Templates</TabsTrigger>
              <TabsTrigger value="stickers">Stickers</TabsTrigger>
              <TabsTrigger value="uploads">Uploads</TabsTrigger>
            </TabsList>

            <TabsContent value="templates" className="mt-4">
              <Label className="text-sm text-muted-foreground">Choose a template to get started</Label>
              <div className="space-y-3 mt-2">
                {sampleTemplates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className="border rounded-lg p-3 hover:bg-accent cursor-pointer"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={template.thumbnail}
                        alt={template.name}
                        className="w-12 h-12 rounded border"
                      />
                      <div>
                        <div className="font-medium text-sm">{template.name}</div>
                        <div className="text-xs text-muted-foreground">{template.category}</div>
                        <div className="text-xs text-muted-foreground">{template.width} × {template.height}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="stickers" className="mt-4">
              <Label className="text-sm text-muted-foreground">Click to add stickers</Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {sampleStickers.map((sticker) => (
                  <Button
                    key={sticker.id}
                    onClick={() => handleStickerSelect(sticker)}
                    variant="outline"
                    className="aspect-square p-2"
                    title={sticker.name}
                  >
                    <img
                      src={sticker.src}
                      alt={sticker.name}
                      className="w-full h-full object-contain"
                    />
                  </Button>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="uploads" className="mt-4">
              <Label className="text-sm text-muted-foreground">Sample images</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {sampleImages.map((image) => (
                  <Button
                    key={image.id}
                    onClick={() => handleAssetImageSelect(image)}
                    variant="outline"
                    className="aspect-square p-2"
                    title={image.name}
                  >
                    <img
                      src={image.src}
                      alt={image.name}
                      className="w-full h-full object-cover rounded"
                    />
                  </Button>
                ))}
              </div>
              
              <div className="mt-4">
                <Label className="text-sm text-muted-foreground">Upload your own image</Label>
                <label className="block mt-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button variant="outline" className="w-full h-20 flex-col">
                    <PhotoIcon className="w-8 h-8 mb-2" />
                    Click to upload image
                  </Button>
                </label>
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
};