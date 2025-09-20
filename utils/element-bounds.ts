import { CanvasElement, TextElement, ShapeElement, ImageElement, StickerElement } from '../types/canvas';

export interface ElementBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Helper function to measure text dimensions more accurately
const measureText = (text: string, fontSize: number, fontFamily: string, lineHeight: number = 1.2): { width: number; height: number } => {
  // Create a temporary canvas element for text measurement
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    // Fallback to estimation if canvas context is not available
    const lines = text.split('\n');
    const longestLine = lines.reduce((longest, line) => 
      line.length > longest.length ? line : longest, ''
    );
    const avgCharWidth = fontSize * 0.6;
    return {
      width: Math.max(longestLine.length * avgCharWidth, 20),
      height: Math.max(lines.length * fontSize * lineHeight, fontSize)
    };
  }
  
  ctx.font = `${fontSize}px ${fontFamily}`;
  
  const lines = text.split('\n');
  let maxWidth = 0;
  
  lines.forEach(line => {
    const metrics = ctx.measureText(line);
    maxWidth = Math.max(maxWidth, metrics.width);
  });
  
  const height = lines.length * fontSize * lineHeight;
  
  return {
    width: Math.max(maxWidth, 20),
    height: Math.max(height, fontSize)
  };
};

export const getElementBounds = (element: CanvasElement): ElementBounds => {
  const { x, y, scaleX = 1, scaleY = 1 } = element.transform;

  switch (element.type) {
    case 'text': {
      const textElement = element as TextElement;
      
      const fontSize = textElement.fontSize * scaleX;
      const fontFamily = textElement.fontFamily || 'Arial';
      const lineHeight = textElement.lineHeight || 1.2;
      
      // Use accurate text measurement
      const textDimensions = measureText(textElement.text, fontSize, fontFamily, lineHeight);
      
      // If element has explicit width/height, use those, otherwise use measured dimensions
      const finalWidth = textElement.width || textDimensions.width;
      const finalHeight = textElement.height || textDimensions.height;
      
      return {
        x,
        y,
        width: finalWidth,
        height: finalHeight
      };
    }

    case 'shape': {
      const shapeElement = element as ShapeElement;
      let baseWidth = 100;
      let baseHeight = 100;
      let offsetX = 0;
      let offsetY = 0;

      switch (shapeElement.shapeType) {
        case 'rectangle':
          // Rectangle uses width=100, height=60, positioned at top-left
          baseWidth = 100;
          baseHeight = 60;
          offsetX = 0;
          offsetY = 0;
          break;
        case 'circle':
          // Circle uses radius=50, centered at (50, 50)
          baseWidth = baseHeight = 100; // 2 * radius
          offsetX = -50; // Adjust for center positioning
          offsetY = -50;
          break;
        case 'triangle':
        case 'polygon':
          // Regular polygons use radius=50, centered at (50, 50)
          baseWidth = baseHeight = 100; // 2 * radius
          offsetX = -50; // Adjust for center positioning
          offsetY = -50;
          break;
        case 'star':
          // Stars use outer radius=50, centered at (50, 50)
          baseWidth = baseHeight = 100; // 2 * outer radius
          offsetX = -50; // Adjust for center positioning
          offsetY = -50;
          break;
        case 'line':
          // Lines use points, default [0, 0, 100, 0]
          if (shapeElement.points && shapeElement.points.length >= 4) {
            const xs = shapeElement.points.filter((_, i) => i % 2 === 0);
            const ys = shapeElement.points.filter((_, i) => i % 2 === 1);
            const minX = Math.min(...xs);
            const maxX = Math.max(...xs);
            const minY = Math.min(...ys);
            const maxY = Math.max(...ys);
            baseWidth = maxX - minX;
            baseHeight = Math.max(maxY - minY, 2); // Minimum 2px height for lines
            offsetX = minX;
            offsetY = minY;
          } else {
            baseWidth = 100;
            baseHeight = 2;
            offsetX = 0;
            offsetY = 0;
          }
          break;
        case 'arrow':
          // Arrows use points, default [0, 50, 100, 50]
          if (shapeElement.points && shapeElement.points.length >= 4) {
            const xs = shapeElement.points.filter((_, i) => i % 2 === 0);
            const ys = shapeElement.points.filter((_, i) => i % 2 === 1);
            const minX = Math.min(...xs);
            const maxX = Math.max(...xs);
            const minY = Math.min(...ys);
            const maxY = Math.max(...ys);
            baseWidth = maxX - minX;
            baseHeight = Math.max(maxY - minY, 20); // Account for arrow head
            offsetX = minX;
            offsetY = minY;
          } else {
            baseWidth = 100;
            baseHeight = 20;
            offsetX = 0;
            offsetY = 50 - 10; // Center vertically
          }
          break;
        case 'path':
          // For paths, use default size
          baseWidth = baseHeight = 100;
          offsetX = offsetY = 0;
          break;
      }

      return {
        x: x + (offsetX * scaleX),
        y: y + (offsetY * scaleY),
        width: baseWidth * scaleX,
        height: baseHeight * scaleY
      };
    }

    case 'image': {
      const imageElement = element as ImageElement;
      const width = (imageElement.cropWidth || 200) * scaleX;
      const height = (imageElement.cropHeight || 200) * scaleY;
      
      return {
        x,
        y,
        width,
        height
      };
    }

    case 'sticker': {
      // For stickers, we need to get the actual image dimensions
      // Since stickers are loaded dynamically, we'll use a reasonable default
      // that gets updated when the image loads
      const stickerElement = element as StickerElement;
      
      // If we have cached dimensions, use them; otherwise use a default
      const defaultSize = 100;
      const width = defaultSize * scaleX * stickerElement.transform.scaleX;
      const height = defaultSize * scaleY * stickerElement.transform.scaleY;
      
      return {
        x,
        y,
        width,
        height
      };
    }

    case 'background': {
      // Background should cover the entire canvas
      return {
        x: 0,
        y: 0,
        width: 1000, // This should be canvas width
        height: 1000  // This should be canvas height
      };
    }

    default:
      return {
        x,
        y,
        width: 100 * scaleX,
        height: 100 * scaleY
      };
  }
};

export const getCombinedBounds = (elements: CanvasElement[]): ElementBounds | null => {
  if (elements.length === 0) return null;

  const bounds = elements.map(getElementBounds);
  
  const left = Math.min(...bounds.map(b => b.x));
  const top = Math.min(...bounds.map(b => b.y));
  const right = Math.max(...bounds.map(b => b.x + b.width));
  const bottom = Math.max(...bounds.map(b => b.y + b.height));

  return {
    x: left,
    y: top,
    width: right - left,
    height: bottom - top
  };
};