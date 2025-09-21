export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Transform {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  skewX?: number;
  skewY?: number;
}

export enum ElementType {
  TEXT = "text",
  IMAGE = "image",
  SHAPE = "shape",
  BACKGROUND = "background",
  STICKER = "sticker",
  DRAWING = "drawing",
  GROUP = "group",
}

export interface ElementBase {
  id: string;
  type: ElementType;
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  transform: Transform;
  zIndex: number;
  groupId?: string;
}

export type ElementTypeUnion = `${ElementType}`;

export interface TextElement extends ElementBase {
  type: ElementType.TEXT;
  text: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: "normal" | "bold";
  fontStyle: "normal" | "italic";
  textDecoration: "none" | "underline" | "line-through";
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  align: "left" | "center" | "right" | "justify";
  verticalAlign: "top" | "middle" | "bottom";
  lineHeight: number;
  letterSpacing: number;
  padding: number;
  width?: number;
  height?: number;
  wrap: "none" | "word" | "char";
  ellipsis?: boolean;
  shadow?: {
    color: string;
    blur: number;
    offset: Point;
  };
}

export interface ImageElement extends ElementBase {
  type: ElementType.IMAGE;
  src: string;
  cropX: number;
  cropY: number;
  cropWidth: number;
  cropHeight: number;
  filters?: {
    brightness?: number;
    contrast?: number;
    blur?: number;
    saturation?: number;
    hue?: number;
    grayscale?: boolean;
    sepia?: boolean;
    invert?: boolean;
  };
  flipX?: boolean;
  flipY?: boolean;
}

export interface ShapeElement extends ElementBase {
  type: ElementType.SHAPE;
  shapeType:
    | "rectangle"
    | "circle"
    | "triangle"
    | "line"
    | "arrow"
    | "polygon"
    | "star"
    | "path";
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  strokeDashArray?: number[];
  cornerRadius?: number;
  points?: number[]; // For polygons, lines, paths
  sides?: number; // For polygons, stars
  innerRadius?: number; // For stars
  shadow?: {
    color: string;
    blur: number;
    offset: Point;
  };
}

export interface BackgroundElement extends ElementBase {
  type: ElementType.BACKGROUND;
  backgroundType: "color" | "gradient" | "image";
  color?: string;
  gradient?: {
    type: "linear" | "radial";
    colorStops: Array<{ color: string; offset: number }>;
    angle?: number; // For linear gradients
  };
  image?: {
    src: string;
    scale: "cover" | "contain" | "fill" | "none";
    position: Point;
  };
}

export interface StickerElement extends ElementBase {
  type: ElementType.STICKER;
  src: string;
  category?: string;
}

export interface DrawingElement extends ElementBase {
  type: ElementType.DRAWING;
  points: number[]; // Array of x,y coordinates [x1, y1, x2, y2, ...]
  stroke: string;
  strokeWidth: number;
  opacity: number;
  lineCap?: "butt" | "round" | "square";
  lineJoin?: "miter" | "round" | "bevel";
  tension?: number; // For smooth curves
  fill?: string; // Optional fill for closed shapes
}

export interface GroupElement extends ElementBase {
  type: ElementType.GROUP;
  children: string[]; // Array of child element IDs
  name: string;
  visible: boolean;
  locked: boolean;
  opacity: number;
  transform: Transform;
  zIndex: number;
  groupId?: string; // Groups can be nested
}

export type CanvasElement =
  | TextElement
  | ImageElement
  | ShapeElement
  | BackgroundElement
  | StickerElement
  | DrawingElement
  | GroupElement;

export interface CanvasState {
  width: number;
  height: number;
  zoom: number;
  pan: Point;
  elements: CanvasElement[];
  selectedIds: string[];
  clipboard: CanvasElement[];
  history: {
    past: CanvasElement[][];
    present: CanvasElement[];
    future: CanvasElement[][];
  };
  grid: {
    enabled: boolean;
    size: number;
    snap: boolean;
  };
  guides: {
    enabled: boolean;
    snap: boolean;
  };
  rulers: {
    enabled: boolean;
  };
  tool: Tool;
  mode: EditorMode;
}

export type Tool =
  | "select"
  | "text"
  | "image"
  | "rectangle"
  | "circle"
  | "triangle"
  | "line"
  | "arrow"
  | "polygon"
  | "star"
  | "brush"
  | "eraser"
  | "pan"
  | "zoom";

export type EditorMode = "design" | "preview";

export interface Template {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  width: number;
  height: number;
  elements: CanvasElement[];
}

export interface AssetLibrary {
  images: Array<{ id: string; src: string; name: string; tags: string[] }>;
  shapes: Array<{ id: string; type: string; name: string; data: any }>;
  stickers: Array<{ id: string; src: string; name: string; category: string }>;
  templates: Template[];
}

export interface ExportOptions {
  format: "png" | "jpg" | "pdf";
  quality: number;
  scale: number;
}

export interface HistoryAction {
  type: "add" | "update" | "delete" | "reorder";
  elementIds: string[];
  before?: CanvasElement[];
  after?: CanvasElement[];
}
