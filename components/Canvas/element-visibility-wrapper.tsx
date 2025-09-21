'use client';

import React, { useRef, useEffect } from 'react';
import { Group } from 'react-konva';
import Konva from 'konva';
import { CanvasElement } from '../../types/canvas';
import { useCanvasStore } from '../../store/canvas-store';

interface Props {
  element: CanvasElement;
  reducedOpacity?: number; // fraction (0-1) to apply to outside portion
  children: React.ReactNode;
}

// This wrapper renders its children twice:
//  - the outside copy: clipped to the area outside the canvas and drawn with reduced opacity
//  - the inside copy: clipped to the canvas rect and drawn normally (full opacity)
// The outside copy is non-interactive (listening=false) so events only hit the inside copy.
export const ElementVisibilityWrapper: React.FC<Props> = ({
  element,
  reducedOpacity = 0.35,
  children,
}) => {
  const { width: canvasWidth, height: canvasHeight } = useCanvasStore();
  const groupRef = useRef<Konva.Group>(null);
  const outsideGroupRef = useRef<Konva.Group>(null);

  // Clip function for inside (keeps only the canvas rect)
  const clipInside = (ctx: Konva.Context) => {
    ctx.beginPath();
    ctx.rect(0, 0, canvasWidth, canvasHeight);
    ctx.clip();
  };

  // Clip function for outside (keeps everything except the canvas rect)
  // We implement it by drawing four rectangles around the canvas rect (top, left, right, bottom)
  // and then clipping to those areas. This avoids relying on 'evenodd' rules.
  const clipOutside = (ctx: Konva.Context) => {
    const big = 10000; // large enough to cover stage

    // top
    ctx.beginPath();
    ctx.rect(-big, -big, big * 2, 0 + big);

    // left
    ctx.rect(-big, 0, 0 + big, canvasHeight);

    // right
    ctx.rect(canvasWidth, 0, big, canvasHeight);

    // bottom
    ctx.rect(-big, canvasHeight, big * 2, big);

    ctx.clip();
  };

  // Force layer redraw during Konva interactions (drag/transform/pointer move)
  useEffect(() => {
    const grp = groupRef.current;
    if (!grp) return;

    const layer = grp.getLayer();
    const stage = grp.getStage();
    if (!layer || !stage) return;

    const onChange = () => {
      // batchDraw is more efficient than draw()
      try {
        // Keep outside clone in sync with the interactive inside node so the faded copy follows live
        try {
          const stage = grp.getStage();
          if (stage && outsideGroupRef.current) {
            const insideNode = stage.findOne(
              `#element-${element.id}`
            ) as Konva.Node | null;
            const outsideNode = outsideGroupRef.current.findOne(
              `#element-${element.id}-outside`
            ) as Konva.Node | null;
            if (insideNode && outsideNode) {
              // copy absolute position
              try {
                const absPos = insideNode.getAbsolutePosition();
                if (typeof outsideNode.setAbsolutePosition === 'function') {
                  outsideNode.setAbsolutePosition(absPos);
                } else {
                  outsideNode.x(absPos.x);
                  outsideNode.y(absPos.y);
                }
              } catch (err) {
                // ignore
              }

              // copy rotation and scale
              try {
                outsideNode.rotation(insideNode.rotation());
                outsideNode.scaleX(insideNode.scaleX());
                outsideNode.scaleY(insideNode.scaleY());
              } catch (err) {
                // ignore
              }
            }
          }
        } catch (err) {
          // ignore
        }
        layer.batchDraw();
      } catch (e) {
        // ignore
      }
    };

    // Update continuously during drag/transform/pointer moves
    stage.on('dragmove', onChange);
    stage.on('transform', onChange);
    stage.on('transformmove', onChange);
    stage.on('pointermove', onChange);
    stage.on('dragstart', onChange);

    return () => {
      stage.off('dragmove', onChange);
      stage.off('transform', onChange);
      stage.off('transformmove', onChange);
      stage.off('pointermove', onChange);
      stage.off('dragstart', onChange);
    };
  }, [element.id]);

  // After mount, rename any descendant node ids within the outside group so
  // transformers / stage.findOne won't accidentally pick the outside copy.
  useEffect(() => {
    const outGrp = outsideGroupRef.current;
    if (!outGrp) return;

    try {
      // Find node with the same id inside outside group and rename it
      const targetId = `element-${element.id}`;
      const node = outGrp.findOne(`#${targetId}`) as Konva.Node | null;
      if (node) {
        node.id(`${targetId}-outside`);
        // also update name if present
        if (node.name && typeof node.name === 'function') {
          try {
            const currentName = node.name();
            node.name(`${currentName}-outside`);
          } catch (e) {
            // ignore
          }
        }
        // redraw layer
        outGrp.getLayer()?.batchDraw();
      }
    } catch (e) {
      // ignore
    }
  }, [element.id]);

  if (!element.visible) return null;

  // Handler to forward pointerdown from outside faded area to the interactive inside node
  const handleOutsidePointerDown = (
    e: Konva.KonvaEventObject<PointerEvent>
  ) => {
    try {
      const stage = groupRef.current?.getStage();
      if (!stage) return;

      const insideNode = stage.findOne(
        `#element-${element.id}`
      ) as Konva.Node | null;
      if (!insideNode) return;

      // Start drag on the inside node using Konva's API. Pass native event in evt.
      // This simulates initiating a drag as if the user clicked the visible inside node.
      if (typeof insideNode.startDrag === 'function') {
        insideNode.startDrag({ evt: e.evt });
      }
    } catch (err) {
      // ignore
    }
  };

  // Hit function for the outside group so it receives pointer events across the faded region.
  const outsideHitFunc = (hitCtx: Konva.Context, shape: Konva.Shape) => {
    const big = 10000;
    hitCtx.beginPath();
    // top
    hitCtx.rect(-big, -big, big * 2, big);
    // left
    hitCtx.rect(-big, 0, big, canvasHeight);
    // right
    hitCtx.rect(canvasWidth, 0, big, canvasHeight);
    // bottom
    hitCtx.rect(-big, canvasHeight, big * 2, big);
    // mark pixels
    hitCtx.fillStrokeShape(shape);
  };

  // Outer group must remain listening so Konva hit-testing descends to children.
  // We set a no-op hitFunc so the outer group itself doesn't create a hit area and won't intercept events.
  const noHit = (hitCtx: Konva.Context, shape: Konva.Shape) => {
    // intentionally empty
  };
  // Clone child for outside copy so we can avoid duplicate ids/names and disable listening.
  let outsideChild: React.ReactNode = null;
  const insideChild: React.ReactNode = children;

  if (React.isValidElement(children)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const childEl = children as React.ReactElement<Record<string, any>>;
    // compute new id/name for outside copy
    const baseId = childEl.props.id || `element-${element.id}`;
    const baseName = childEl.props.name || `element-${element.id}`;

    outsideChild = React.cloneElement(childEl, {
      id: `${baseId}-outside`,
      name: `${baseName}-outside`,
      listening: false,
      opacity: 1, // let wrapper control final reduced opacity
    });
  } else {
    outsideChild = children;
  }

  return (
    <Group ref={groupRef} hitFunc={noHit}>
      {/* Outside faded copy (drawn first). We apply only the reducedOpacity here; child opacity set to 1 above */}
      <Group
        ref={outsideGroupRef}
        clipFunc={clipOutside}
        opacity={reducedOpacity}
        // ensure outside area accepts pointer down so we can forward the drag
        listening={true}
        hitFunc={outsideHitFunc}
        onPointerDown={handleOutsidePointerDown}
      >
        {outsideChild}
      </Group>

      {/* Inside full copy (drawn on top) - no wrapper opacity so children render normally */}
      <Group clipFunc={clipInside}>{insideChild}</Group>
    </Group>
  );
};

export default ElementVisibilityWrapper;
