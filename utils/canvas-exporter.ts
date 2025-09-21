import Konva from "konva";
import jsPDF from "jspdf";
import { saveAs } from "file-saver";
import { ExportOptions } from "../types/canvas";

export class CanvasExporter {
  static async exportStage(
    stage: Konva.Stage,
    options: ExportOptions,
  ): Promise<void> {
    const { format, quality, scale, transparentBackground, selectedOnly } =
      options;

    try {
      let dataURL: string;

      // Clone the stage for export
      const exportStage = stage.clone();

      // Filter elements if selectedOnly is true
      if (selectedOnly) {
        // This would need to be implemented based on selection state
        // For now, we'll export the full stage
      }

      // Apply scale
      if (scale !== 1) {
        exportStage.scale({ x: scale, y: scale });
        exportStage.width(stage.width() * scale);
        exportStage.height(stage.height() * scale);
      }

      switch (format) {
        case "png":
          dataURL = exportStage.toDataURL({
            mimeType: "image/png",
            quality: quality,
            pixelRatio: scale,
          });
          this.downloadDataURL(dataURL, "canvas-export.png");
          break;

        case "jpg":
          // For JPG, we need to handle transparency
          if (!transparentBackground) {
            // Add white background
            const layer = new Konva.Layer();
            const background = new Konva.Rect({
              x: 0,
              y: 0,
              width: exportStage.width(),
              height: exportStage.height(),
              fill: "white",
            });
            layer.add(background);
            exportStage.add(layer);
            layer.moveToBottom();
          }

          dataURL = exportStage.toDataURL({
            mimeType: "image/jpeg",
            quality: quality,
            pixelRatio: scale,
          });
          this.downloadDataURL(dataURL, "canvas-export.jpg");
          break;

        case "svg":
          // For SVG export, we need to manually convert Konva to SVG
          const svgString = this.konvaToSVG(exportStage);
          const blob = new Blob([svgString], { type: "image/svg+xml" });
          saveAs(blob, "canvas-export.svg");
          break;

        case "pdf":
          await this.exportToPDF(exportStage, quality, scale);
          break;

        default:
          throw new Error(`Unsupported format: ${format}`);
      }
    } catch (error) {
      console.error("Export failed:", error);
      throw error;
    }
  }

  private static downloadDataURL(dataURL: string, filename: string): void {
    const link = document.createElement("a");
    link.download = filename;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  private static async exportToPDF(
    stage: Konva.Stage,
    quality: number,
    scale: number,
  ): Promise<void> {
    const dataURL = stage.toDataURL({
      mimeType: "image/png",
      quality: quality,
      pixelRatio: scale,
    });

    const pdf = new jsPDF({
      orientation: stage.width() > stage.height() ? "landscape" : "portrait",
      unit: "px",
      format: [stage.width() * scale, stage.height() * scale],
    });

    pdf.addImage(
      dataURL,
      "PNG",
      0,
      0,
      stage.width() * scale,
      stage.height() * scale,
    );

    pdf.save("canvas-export.pdf");
  }

  private static konvaToSVG(stage: Konva.Stage): string {
    // Basic SVG conversion - this is a simplified version
    // In a production app, you'd want a more comprehensive conversion
    const width = stage.width();
    const height = stage.height();

    let svgContent = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;

    // This is a placeholder - you'd need to implement proper Konva to SVG conversion
    // For each layer and shape in the stage
    stage.children.forEach((layer) => {
      if (layer instanceof Konva.Layer) {
        layer.children.forEach((node) => {
          svgContent += this.nodeToSVG(node);
        });
      }
    });

    svgContent += "</svg>";
    return svgContent;
  }

  private static nodeToSVG(node: any): string {
    // Simplified node to SVG conversion
    // This would need to be much more comprehensive for production use
    if (node instanceof Konva.Rect) {
      return `<rect x="${node.x()}" y="${node.y()}" width="${node.width()}" height="${node.height()}" fill="${node.fill() || "none"}" stroke="${node.stroke() || "none"}" />`;
    } else if (node instanceof Konva.Circle) {
      return `<circle cx="${node.x()}" cy="${node.y()}" r="${node.radius()}" fill="${node.fill() || "none"}" stroke="${node.stroke() || "none"}" />`;
    } else if (node instanceof Konva.Text) {
      return `<text x="${node.x()}" y="${node.y()}" fill="${node.fill() || "black"}" font-size="${node.fontSize()}" font-family="${node.fontFamily()}">${node.text()}</text>`;
    }
    // Add more node types as needed
    return "";
  }
}

export default CanvasExporter;
