"use client";

import React, { useState } from "react";
import { useCanvasStore } from "../../store/canvas-store";
import {
  TextElement,
  ImageElement,
  ShapeElement,
  CanvasElement,
} from "../../types/canvas";
import { Input } from "./input";
import { Label } from "./label";
import { Button } from "./button";
import { Slider } from "./slider";
import { Checkbox } from "./checkbox";
import { Sketch } from "@uiw/react-color";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

export const PropertiesPanel: React.FC = () => {
  const { selectedIds, elements, updateElement } = useCanvasStore();
  const [colorPickerOpen, setColorPickerOpen] = useState<string | null>(null);

  if (selectedIds.length === 0) {
    return (
      <div className="p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-3">
          Properties
        </h3>
        <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-4">
          Select an element to edit its properties
        </div>
      </div>
    );
  }

  if (selectedIds.length > 1) {
    return (
      <div className="p-6">
        <h3 className="text-base font-semibold text-gray-900 mb-3">
          Properties
        </h3>
        <div className="text-sm text-gray-500 bg-gray-50 rounded-lg p-4">
          Multiple elements selected
        </div>
      </div>
    );
  }

  const element = elements.find((el) => el.id === selectedIds[0]);
  if (!element) return null;

  const handleUpdate = (updates: Partial<CanvasElement>) => {
    updateElement(element.id, updates);
  };

  const renderTextProperties = (textElement: TextElement) => (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-2 block">
          Text Content
        </Label>
        <Input
          value={textElement.text}
          onChange={(e) =>
            updateElement(textElement.id, { text: e.target.value })
          }
          className="w-full"
          placeholder="Enter text content"
        />
      </div>

      <div>
        <Label className="text-sm font-medium text-gray-700 mb-2 block">
          Font Size
        </Label>
        <Slider
          value={[textElement.fontSize]}
          onValueChange={(value) =>
            updateElement(textElement.id, { fontSize: value[0] })
          }
          max={72}
          min={8}
          step={1}
          className="w-full"
        />
        <div className="text-xs text-gray-500 mt-1">
          {textElement.fontSize}px
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium text-gray-700 mb-2 block">
          Font Family
        </Label>
        <Select
          value={textElement.fontFamily}
          onValueChange={(value) =>
            updateElement(textElement.id, { fontFamily: value })
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Arial">Arial</SelectItem>
            <SelectItem value="Helvetica">Helvetica</SelectItem>
            <SelectItem value="Times New Roman">Times New Roman</SelectItem>
            <SelectItem value="Georgia">Georgia</SelectItem>
            <SelectItem value="Verdana">Verdana</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-sm font-medium text-gray-700 mb-2 block">
          Text Color
        </Label>
        <div className="flex items-center gap-2">
          <Popover
            open={colorPickerOpen === "text-fill"}
            onOpenChange={(open) =>
              setColorPickerOpen(open ? "text-fill" : null)
            }
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-8 h-8 p-0 border-2"
                style={{ backgroundColor: textElement.fill }}
              />
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3" align="start">
              <div className="mb-2">
                <Label className="text-sm font-medium">Choose Text Color</Label>
              </div>
              <Sketch
                color={textElement.fill}
                onChange={(color) => {
                  updateElement(textElement.id, { fill: color.hex });
                }}
              />
            </PopoverContent>
          </Popover>
          <Input
            value={textElement.fill}
            onChange={(e) =>
              updateElement(textElement.id, { fill: e.target.value })
            }
            className="flex-1"
            placeholder="#000000"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="bold"
          checked={textElement.fontWeight === "bold"}
          onCheckedChange={(checked) =>
            updateElement(textElement.id, {
              fontWeight: checked ? "bold" : "normal",
            })
          }
        />
        <Label htmlFor="bold" className="text-sm font-medium text-gray-700">
          Bold
        </Label>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="italic"
          checked={textElement.fontStyle === "italic"}
          onCheckedChange={(checked) =>
            updateElement(textElement.id, {
              fontStyle: checked ? "italic" : "normal",
            })
          }
        />
        <Label htmlFor="italic" className="text-sm font-medium text-gray-700">
          Italic
        </Label>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="underline"
          checked={textElement.textDecoration === "underline"}
          onCheckedChange={(checked) =>
            updateElement(textElement.id, {
              textDecoration: checked ? "underline" : "none",
            })
          }
        />
        <Label
          htmlFor="underline"
          className="text-sm font-medium text-gray-700"
        >
          Underline
        </Label>
      </div>
    </div>
  );

  const renderShapeProperties = (shapeElement: ShapeElement) => (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium text-gray-700 mb-2 block">
          Fill Color
        </Label>
        <div className="flex items-center gap-2">
          <Popover
            open={colorPickerOpen === "shape-fill"}
            onOpenChange={(open) =>
              setColorPickerOpen(open ? "shape-fill" : null)
            }
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-8 h-8 p-0 border-2"
                style={{ backgroundColor: shapeElement.fill || "#000000" }}
              />
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3" align="start">
              <div className="mb-2">
                <Label className="text-sm font-medium">Choose Fill Color</Label>
              </div>
              <Sketch
                color={shapeElement.fill || "#000000"}
                onChange={(color) => {
                  handleUpdate({ fill: color.hex });
                }}
              />
            </PopoverContent>
          </Popover>
          <Input
            value={shapeElement.fill || "#000000"}
            onChange={(e) => handleUpdate({ fill: e.target.value })}
            className="flex-1"
            placeholder="#000000"
          />
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium text-gray-700 mb-2 block">
          Stroke Color
        </Label>
        <div className="flex items-center gap-2">
          <Popover
            open={colorPickerOpen === "shape-stroke"}
            onOpenChange={(open) =>
              setColorPickerOpen(open ? "shape-stroke" : null)
            }
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-8 h-8 p-0 border-2"
                style={{ backgroundColor: shapeElement.stroke || "#000000" }}
              />
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3" align="start">
              <div className="mb-2">
                <Label className="text-sm font-medium">
                  Choose Stroke Color
                </Label>
              </div>
              <Sketch
                color={shapeElement.stroke || "#000000"}
                onChange={(color) => {
                  handleUpdate({ stroke: color.hex });
                }}
              />
            </PopoverContent>
          </Popover>
          <Input
            value={shapeElement.stroke || "#000000"}
            onChange={(e) => handleUpdate({ stroke: e.target.value })}
            className="flex-1"
            placeholder="#000000"
          />
        </div>
      </div>

      <div>
        <Label
          htmlFor="stroke-width"
          className="text-sm font-medium text-gray-700 mb-2 block"
        >
          Stroke Width
        </Label>
        <Input
          id="stroke-width"
          type="number"
          value={shapeElement.strokeWidth || 0}
          onChange={(e) =>
            handleUpdate({ strokeWidth: parseInt(e.target.value) })
          }
          min="0"
          max="20"
          className="w-full"
        />
      </div>

      {shapeElement.shapeType === "rectangle" && (
        <div>
          <Label
            htmlFor="corner-radius"
            className="text-sm font-medium text-gray-700 mb-2 block"
          >
            Corner Radius
          </Label>
          <Input
            id="corner-radius"
            type="number"
            value={shapeElement.cornerRadius || 0}
            onChange={(e) =>
              handleUpdate({ cornerRadius: parseInt(e.target.value) })
            }
            min="0"
            max="50"
            className="w-full"
          />
        </div>
      )}
    </div>
  );
  const renderImageProperties = (imageElement: ImageElement) => (
    <div className="space-y-4">
      <div>
        <Label
          htmlFor="image-url"
          className="text-sm font-medium text-gray-700 mb-2 block"
        >
          Image URL
        </Label>
        <Input
          id="image-url"
          type="text"
          value={imageElement.src}
          onChange={(e) => handleUpdate({ src: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={() => handleUpdate({ flipX: !imageElement.flipX })}
          variant={imageElement.flipX ? "default" : "outline"}
          size="sm"
        >
          Flip X
        </Button>

        <Button
          onClick={() => handleUpdate({ flipY: !imageElement.flipY })}
          variant={imageElement.flipY ? "default" : "outline"}
          size="sm"
        >
          Flip Y
        </Button>
      </div>

      {imageElement.filters && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Filters</h4>

          <div>
            <Label className="text-sm font-medium text-gray-700 mb-1 block">
              Brightness: {imageElement.filters.brightness || 0}
            </Label>
            <Slider
              value={[imageElement.filters.brightness || 0]}
              onValueChange={(value) =>
                handleUpdate({
                  filters: {
                    ...imageElement.filters,
                    brightness: value[0],
                  },
                })
              }
              min={-1}
              max={1}
              step={0.1}
              className="w-full"
            />
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700 mb-1 block">
              Contrast: {imageElement.filters.contrast || 0}
            </Label>
            <Slider
              value={[imageElement.filters.contrast || 0]}
              onValueChange={(value) =>
                handleUpdate({
                  filters: {
                    ...imageElement.filters,
                    contrast: value[0],
                  },
                })
              }
              min={-1}
              max={1}
              step={0.1}
              className="w-full"
            />
          </div>
        </div>
      )}
    </div>
  );

  const renderCommonProperties = () => (
    <div className="space-y-4 mt-5 pt-4 border-t border-gray-200">
      <h4 className="text-sm font-semibold text-gray-900">
        Position & Transform
      </h4>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label
            htmlFor="pos-x"
            className="text-sm font-medium text-gray-700 mb-1 block"
          >
            X
          </Label>
          <Input
            id="pos-x"
            type="number"
            value={Math.round(element.transform.x)}
            onChange={(e) =>
              handleUpdate({
                transform: {
                  ...element.transform,
                  x: parseInt(e.target.value),
                },
              })
            }
            className="w-full"
          />
        </div>

        <div>
          <Label
            htmlFor="pos-y"
            className="text-sm font-medium text-gray-700 mb-1 block"
          >
            Y
          </Label>
          <Input
            id="pos-y"
            type="number"
            value={Math.round(element.transform.y)}
            onChange={(e) =>
              handleUpdate({
                transform: {
                  ...element.transform,
                  y: parseInt(e.target.value),
                },
              })
            }
            className="w-full"
          />
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium text-gray-700 mb-2 block">
          Opacity: {Math.round(element.opacity * 100)}%
        </Label>
        <Slider
          value={[element.opacity]}
          onValueChange={(value) => handleUpdate({ opacity: value[0] })}
          min={0}
          max={1}
          step={0.01}
          className="w-full"
        />
      </div>

      <div>
        <Label className="text-sm font-medium text-gray-700 mb-2 block">
          Rotation: {Math.round(element.transform.rotation)}°
        </Label>
        <Slider
          value={[element.transform.rotation]}
          onValueChange={(value) =>
            handleUpdate({
              transform: { ...element.transform, rotation: value[0] },
            })
          }
          min={0}
          max={360}
          step={1}
          className="w-full"
        />
      </div>
    </div>
  );

  return (
    <div className="p-6 overflow-y-auto h-full">
      <h3 className="text-base font-semibold text-gray-900 mb-4">Properties</h3>

      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-600 mb-1">Element Type</div>
        <div className="text-sm font-medium text-gray-900 capitalize">
          {element.type}
        </div>
      </div>

      {element.type === "text" && renderTextProperties(element as TextElement)}
      {element.type === "shape" &&
        renderShapeProperties(element as ShapeElement)}
      {element.type === "image" &&
        renderImageProperties(element as ImageElement)}

      {renderCommonProperties()}
    </div>
  );
};
