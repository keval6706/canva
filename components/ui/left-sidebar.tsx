"use client";

import React, { useState, useRef } from "react";
import {
  CursorArrowRaysIcon,
  ChatBubbleBottomCenterTextIcon,
  PhotoIcon,
  Square3Stack3DIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";
import { useCanvasStore } from "../../store/canvas-store";
import { Tool, CanvasElement, Template, ElementType } from "../../types/canvas";
import {
  sampleTemplates,
  sampleStickers,
  sampleImages,
} from "../../data/sample-assets";
import { Button } from "./button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
import { Label } from "./label";

interface ToolItem {
  id: Tool;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

const tools: ToolItem[] = [
  { id: "select", name: "Select", icon: CursorArrowRaysIcon },
  { id: "brush", name: "Brush", icon: PencilIcon },
  { id: "text", name: "Text", icon: ChatBubbleBottomCenterTextIcon },
  { id: "image", name: "Images", icon: PhotoIcon },
  { id: "rectangle", name: "Shapes", icon: Square3Stack3DIcon },
];

export const LeftSidebar: React.FC = () => {
  const {
    tool,
    setTool,
    addElement,
    setCanvasSize,
    width: canvasWidth,
    height: canvasHeight,
  } = useCanvasStore();

  const [toolsUploadKey, setToolsUploadKey] = useState(0);
  const [assetsUploadKey, setAssetsUploadKey] = useState(0);
  const [isUploadingTools, setIsUploadingTools] = useState(false);
  const [isUploadingAssets, setIsUploadingAssets] = useState(false);

  const toolsFileInputRef = useRef<HTMLInputElement>(null);
  const assetsFileInputRef = useRef<HTMLInputElement>(null);

  const handleToolsUploadClick = () => {
    toolsFileInputRef.current?.click();
  };

  const handleAssetsUploadClick = () => {
    assetsFileInputRef.current?.click();
  };

  // Helper function to calculate image scaling and positioning
  const calculateImageTransform = (
    imageWidth: number,
    imageHeight: number,
    canvasWidth: number,
    canvasHeight: number,
  ) => {
    // Maximum size the image should occupy (80% of canvas to leave some margin)
    const maxWidth = canvasWidth * 0.8;
    const maxHeight = canvasHeight * 0.8;

    // Calculate scale to fit within bounds while maintaining aspect ratio
    const scaleX = maxWidth / imageWidth;
    const scaleY = maxHeight / imageHeight;
    const scale = Math.min(scaleX, scaleY, 1); // Don't scale up images smaller than max size

    // Calculate scaled dimensions
    const scaledWidth = imageWidth * scale;
    const scaledHeight = imageHeight * scale;

    // Center the image on canvas
    const x = (canvasWidth - scaledWidth) / 2;
    const y = (canvasHeight - scaledHeight) / 2;

    return {
      x,
      y,
      scaleX: scale,
      scaleY: scale,
      scaledWidth,
      scaledHeight,
    };
  };

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

  const handleStickerSelect = (sticker: {
    id: string;
    name: string;
    src: string;
    category: string;
  }) => {
    // Create a temporary image to get dimensions
    const img = new Image();
    img.onload = () => {
      // Calculate appropriate scaling for stickers (smaller max size than regular images)
      const maxStickerWidth = canvasWidth * 0.3; // 30% of canvas width
      const maxStickerHeight = canvasHeight * 0.3; // 30% of canvas height

      const scaleX = maxStickerWidth / img.naturalWidth;
      const scaleY = maxStickerHeight / img.naturalHeight;
      const scale = Math.min(scaleX, scaleY, 1); // Don't scale up small stickers

      const scaledWidth = img.naturalWidth * scale;
      const scaledHeight = img.naturalHeight * scale;

      // Position sticker with some offset from center
      const x = (canvasWidth - scaledWidth) / 2 + Math.random() * 50 - 25;
      const y = (canvasHeight - scaledHeight) / 2 + Math.random() * 50 - 25;

      const stickerElement = {
        type: ElementType.STICKER,
        name: sticker.name,
        visible: true,
        locked: false,
        opacity: 1,
        transform: {
          x: Math.max(0, Math.min(x, canvasWidth - scaledWidth)),
          y: Math.max(0, Math.min(y, canvasHeight - scaledHeight)),
          scaleX: scale,
          scaleY: scale,
          rotation: 0,
        },
        src: sticker.src,
        category: sticker.category,
      };

      addElement(stickerElement);
    };
    img.src = sticker.src;
  };

  const handleAssetImageSelect = (image: {
    id: string;
    name: string;
    src: string;
  }) => {
    // Create a temporary image to get dimensions
    const img = new Image();
    img.onload = () => {
      // Calculate appropriate scaling and positioning
      const transform = calculateImageTransform(
        img.naturalWidth,
        img.naturalHeight,
        canvasWidth,
        canvasHeight,
      );

      const imageElement = {
        type: ElementType.IMAGE,
        name: image.name,
        visible: true,
        locked: false,
        opacity: 1,
        transform: {
          x: transform.x,
          y: transform.y,
          scaleX: transform.scaleX,
          scaleY: transform.scaleY,
          rotation: 0,
        },
        src: image.src,
        cropX: 0,
        cropY: 0,
        cropWidth: img.naturalWidth,
        cropHeight: img.naturalHeight,
      };

      addElement(imageElement);
    };
    img.src = image.src;
  };

  const handleAddShape = (shapeType: string) => {
    const shapeElement = {
      type: ElementType.SHAPE,
      name: `${shapeType.charAt(0).toUpperCase() + shapeType.slice(1)}`,
      visible: true,
      locked: false,
      opacity: 1,
      transform: {
        x: 100,
        y: 100,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
      },
      shapeType: shapeType as
        | "rectangle"
        | "circle"
        | "triangle"
        | "hexagon"
        | "star"
        | "line"
        | "arrow",
      fill: "#3B82F6",
      stroke: "#1E40AF",
      strokeWidth: 2,
    };

    addElement(shapeElement);
  };

  const handleImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    source: "tools" | "assets",
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Set loading state
    if (source === "tools") {
      setIsUploadingTools(true);
    } else {
      setIsUploadingAssets(true);
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      event.target.value = "";
      if (source === "tools") {
        setIsUploadingTools(false);
      } else {
        setIsUploadingAssets(false);
      }
      return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert("File size must be less than 10MB.");
      event.target.value = "";
      if (source === "tools") {
        setIsUploadingTools(false);
      } else {
        setIsUploadingAssets(false);
      }
      return;
    }

    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const src = e.target?.result as string;
      if (src) {
        // Create a temporary image to get dimensions
        const img = new Image();
        img.onload = () => {
          // Calculate appropriate scaling and positioning
          const transform = calculateImageTransform(
            img.naturalWidth,
            img.naturalHeight,
            canvasWidth,
            canvasHeight,
          );

          const imageElement = {
            type: ElementType.IMAGE,
            name: file.name,
            visible: true,
            locked: false,
            opacity: 1,
            transform: {
              x: transform.x,
              y: transform.y,
              scaleX: transform.scaleX,
              scaleY: transform.scaleY,
              rotation: 0,
            },
            src,
            cropX: 0,
            cropY: 0,
            cropWidth: img.naturalWidth,
            cropHeight: img.naturalHeight,
          };

          addElement(imageElement);

          // Reset the input value and update key to allow re-uploading the same file
          event.target.value = "";
          if (source === "tools") {
            setToolsUploadKey((prev) => prev + 1);
            setIsUploadingTools(false);
          } else {
            setAssetsUploadKey((prev) => prev + 1);
            setIsUploadingAssets(false);
          }
        };
        img.src = src;
      }
    };

    reader.onerror = () => {
      alert("Failed to read the image file. Please try again.");
      event.target.value = "";
      if (source === "tools") {
        setIsUploadingTools(false);
      } else {
        setIsUploadingAssets(false);
      }
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      <Tabs defaultValue="tools" className="flex flex-col h-full">
        <div className="px-4 py-3 border-b border-gray-200">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tools" className="text-sm">
              Tools
            </TabsTrigger>
            <TabsTrigger value="assets" className="text-sm">
              Assets
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="tools" className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            <div>
              <Label className="text-sm font-semibold text-gray-900 mb-3 block">
                Tools
              </Label>
              <div className="space-y-2">
                {tools.map((toolItem) => (
                  <Button
                    key={toolItem.id}
                    onClick={() => handleToolSelect(toolItem.id)}
                    variant={tool === toolItem.id ? "default" : "ghost"}
                    className="w-full justify-start h-10 px-4"
                  >
                    <toolItem.icon className="w-5 h-5 mr-3" />
                    {toolItem.name}
                  </Button>
                ))}
              </div>
            </div>

            {tool === "rectangle" && (
              <div>
                <Label className="text-sm font-semibold text-gray-900 mb-3 block">
                  Shapes
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  {["rectangle", "circle", "triangle", "star"].map((shape) => (
                    <Button
                      key={shape}
                      onClick={() => handleAddShape(shape)}
                      variant="outline"
                      className="h-11 text-sm"
                    >
                      {shape.charAt(0).toUpperCase() + shape.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {tool === "image" && (
              <div>
                <Label className="text-sm font-semibold text-gray-900 mb-3 block">
                  Add Image
                </Label>
                <div className="block">
                  <input
                    ref={toolsFileInputRef}
                    key={toolsUploadKey}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "tools")}
                    className="hidden"
                    aria-label="Upload image file"
                    aria-describedby="tools-upload-description"
                  />
                  <Button
                    variant="outline"
                    className="w-full h-20 flex-col border-2 border-dashed border-gray-300 hover:border-gray-400"
                    disabled={isUploadingTools}
                    onClick={handleToolsUploadClick}
                    aria-describedby="tools-upload-description"
                  >
                    {isUploadingTools ? (
                      <>
                        <div
                          className="w-7 h-7 mb-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"
                          aria-hidden="true"
                        ></div>
                        <span className="text-sm text-gray-600">
                          Uploading...
                        </span>
                      </>
                    ) : (
                      <>
                        <PhotoIcon
                          className="w-7 h-7 mb-3 text-gray-400"
                          aria-hidden="true"
                        />
                        <span className="text-sm text-gray-600">
                          Click to upload image
                        </span>
                      </>
                    )}
                  </Button>
                  <div id="tools-upload-description" className="sr-only">
                    Select an image file to upload. Supported formats: JPG, PNG,
                    GIF, WebP, SVG. Maximum file size: 10MB.
                  </div>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="assets" className="flex-1 overflow-y-auto">
          <Tabs defaultValue="templates" className="w-full">
            <div className="px-4 py-3 border-b border-gray-200">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="templates" className="text-xs">
                  Templates
                </TabsTrigger>
                <TabsTrigger value="stickers" className="text-xs">
                  Stickers
                </TabsTrigger>
                <TabsTrigger value="uploads" className="text-xs">
                  Uploads
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="templates" className="p-6">
              <Label className="text-sm font-semibold text-gray-900 mb-3 block">
                Choose a template
              </Label>
              <div className="space-y-3">
                {sampleTemplates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 hover:border-gray-300 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={template.thumbnail}
                        alt={template.name}
                        className="w-14 h-14 rounded-lg border border-gray-200"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-sm text-gray-900">
                          {template.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {template.category}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {template.width} × {template.height}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="stickers" className="p-6">
              <Label className="text-sm font-semibold text-gray-900 mb-3 block">
                Click to add stickers
              </Label>
              <div className="grid grid-cols-4 gap-3">
                {sampleStickers.map((sticker) => (
                  <Button
                    key={sticker.id}
                    onClick={() => handleStickerSelect(sticker)}
                    variant="outline"
                    className="aspect-square p-3 hover:bg-gray-50"
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

            <TabsContent value="uploads" className="p-6">
              <Label className="text-sm font-semibold text-gray-900 mb-3 block">
                Sample images
              </Label>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {sampleImages.map((image) => (
                  <Button
                    key={image.id}
                    onClick={() => handleAssetImageSelect(image)}
                    variant="outline"
                    className="aspect-square p-3 hover:bg-gray-50"
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

              <div>
                <Label className="text-sm font-semibold text-gray-900 mb-3 block">
                  Upload your own image
                </Label>
                <div className="block">
                  <input
                    ref={assetsFileInputRef}
                    key={assetsUploadKey}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "assets")}
                    className="hidden"
                    aria-label="Upload image file"
                    aria-describedby="assets-upload-description"
                  />
                  <Button
                    variant="outline"
                    className="w-full h-20 flex-col border-2 border-dashed border-gray-300 hover:border-gray-400"
                    disabled={isUploadingAssets}
                    onClick={handleAssetsUploadClick}
                    aria-describedby="assets-upload-description"
                  >
                    {isUploadingAssets ? (
                      <>
                        <div
                          className="w-7 h-7 mb-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"
                          aria-hidden="true"
                        ></div>
                        <span className="text-sm text-gray-600">
                          Uploading...
                        </span>
                      </>
                    ) : (
                      <>
                        <PhotoIcon
                          className="w-7 h-7 mb-3 text-gray-400"
                          aria-hidden="true"
                        />
                        <span className="text-sm text-gray-600">
                          Click to upload image
                        </span>
                      </>
                    )}
                  </Button>
                  <div id="assets-upload-description" className="sr-only">
                    Select an image file to upload. Supported formats: JPG, PNG,
                    GIF, WebP, SVG. Maximum file size: 10MB.
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
};
