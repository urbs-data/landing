// @vitest-environment jsdom
import { act, render, waitFor } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ConnectionsCanvas } from "./connections-canvas";

vi.mock("motion/react-client", () => ({
  canvas: React.forwardRef<
    HTMLCanvasElement,
    React.CanvasHTMLAttributes<HTMLCanvasElement> & {
      animate?: { opacity?: number; transform?: string };
      initial?: unknown;
      transition?: unknown;
    }
  >(function MockMotionCanvas(
    { animate, initial: _initial, transition: _transition, style, ...props },
    ref,
  ) {
    return (
      <canvas
        ref={ref}
        style={{
          ...style,
          opacity: animate?.opacity,
          transform: animate?.transform,
        }}
        {...props}
      />
    );
  }),
}));

type CanvasContextMock = Pick<
  CanvasRenderingContext2D,
  | "arc"
  | "beginPath"
  | "clearRect"
  | "fill"
  | "lineTo"
  | "moveTo"
  | "setTransform"
  | "stroke"
> & {
  fillStyle: string;
  lineWidth: number;
  strokeStyle: string;
};

const createContextMock = (): CanvasContextMock => ({
  arc: vi.fn(),
  beginPath: vi.fn(),
  clearRect: vi.fn(),
  fill: vi.fn(),
  lineTo: vi.fn(),
  moveTo: vi.fn(),
  setTransform: vi.fn(),
  stroke: vi.fn(),
  fillStyle: "",
  lineWidth: 0,
  strokeStyle: "",
});

describe("ConnectionsCanvas", () => {
  let context: CanvasContextMock;
  let animationFrameId = 0;
  let animationFrames = new Map<number, FrameRequestCallback>();
  let width = 640;
  let height = 360;

  beforeEach(() => {
    context = createContextMock();
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
      context as unknown as CanvasRenderingContext2D,
    );
    vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockImplementation(
      () => width,
    );
    vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockImplementation(
      () => height,
    );
    vi.stubGlobal(
      "requestAnimationFrame",
      vi.fn((callback: FrameRequestCallback) => {
        animationFrameId += 1;
        animationFrames.set(animationFrameId, callback);
        return animationFrameId;
      }),
    );
    vi.stubGlobal(
      "cancelAnimationFrame",
      vi.fn((id: number) => animationFrames.delete(id)),
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    animationFrameId = 0;
    animationFrames = new Map();
    width = 640;
    height = 360;
  });

  it("paints a visible frame when ResizeObserver is unavailable", async () => {
    vi.stubGlobal("ResizeObserver", undefined);

    const { container } = render(<ConnectionsCanvas density={1.4} />);
    const canvas = container.querySelector("canvas");

    await waitFor(() => expect(canvas?.style.opacity).toBe("1"));
    expect(context.arc).toHaveBeenCalled();
    expect(context.clearRect).toHaveBeenCalledWith(0, 0, width, height);
  });

  it("continues animating after a delayed resize", async () => {
    width = 0;
    height = 0;
    let onResize: ResizeObserverCallback | undefined;

    class ResizeObserverMock implements ResizeObserver {
      constructor(callback: ResizeObserverCallback) {
        onResize = callback;
      }

      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    }

    vi.stubGlobal("ResizeObserver", ResizeObserverMock);

    const { container } = render(<ConnectionsCanvas />);
    const canvas = container.querySelector("canvas");

    expect(context.arc).not.toHaveBeenCalled();

    width = 640;
    height = 360;
    await act(async () => {
      onResize?.([], {} as ResizeObserver);
    });

    await waitFor(() => expect(canvas?.style.opacity).toBe("1"));
    expect(context.arc).toHaveBeenCalled();
    expect(animationFrames.size).toBe(1);

    const paintedFrames = vi.mocked(context.clearRect).mock.calls.length;
    await act(async () => {
      const [frameId, frameCallback] = Array.from(animationFrames)[0];
      animationFrames.delete(frameId);
      frameCallback(performance.now());
    });

    expect(context.clearRect).toHaveBeenCalledTimes(paintedFrames + 1);
    expect(animationFrames.size).toBe(1);
  });
});
