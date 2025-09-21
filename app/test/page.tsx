"use client";

import React from "react";
import { Canvas } from "../../components/canvas/canvas";
import { useCanvasStore } from "../../store/canvas-store";
import { ElementType } from "../../types/canvas";

export default function CanvasTest() {
  const { addElement, setCanvasSize } = useCanvasStore();

  React.useEffect(() => {
    // Set canvas size
    setCanvasSize(400, 400);

    // Add a test text element that extends outside the canvas
    const testTextElement = {
      type: ElementType.TEXT,
      name: "Test Text",
      visible: true,
      locked: false,
      opacity: 1,
      transform: {
        x: -50, // Starts outside canvas
        y: 50,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
      },
      text: "Life is an ADVENTURE",
      fontSize: 40,
      fontFamily: "Calibri",
      fontWeight: "normal" as const,
      fontStyle: "normal" as const,
      textDecoration: "none" as const,
      fill: "#000000",
      align: "left" as const,
      verticalAlign: "top" as const,
      lineHeight: 1.2,
      letterSpacing: 0,
      padding: 0,
      wrap: "word" as const,
    };

    // Add a test shape element
    const testShapeElement = {
      type: ElementType.SHAPE,
      name: "Test Rectangle",
      visible: true,
      locked: false,
      opacity: 1,
      transform: {
        x: 350, // Extends outside canvas right edge
        y: 150,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
      },
      shapeType: "rectangle" as const,
      fill: "#ff6b6b",
      stroke: "#000000",
      strokeWidth: 2,
    };

    addElement(testTextElement);
    addElement(testShapeElement);
  }, [addElement, setCanvasSize]);

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gray-50">
      <div className="border border-gray-300 shadow-lg">
        <Canvas width={600} height={600} className="bg-white" />
      </div>
    </div>
  );
}
