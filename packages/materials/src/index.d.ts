/** plan C4: standalone experimental API, independent of window.Hypermetapunk. */
export type MaterialId = 'dusk' | 'zine' | 'contrast' | 'rainprint' | 'schism' | 'steamfunk' | 'raeverfaelt' | 'strawberry';
export type Layer = 'surface' | 'subterrain';
export interface PaintMark { x: number; y: number; radius?: number }
export interface BrushMark extends PaintMark { direction: number }
export interface RenderOptions {
  look?: MaterialId; layer?: Layer; backgroundLook?: MaterialId;
  /** Physical pixels, 1..2048 on each axis. No implicit devicePixelRatio. */
  width?: number; height?: number; seed?: number;
  detail?: number; rain?: number; nap?: number; invert?: boolean;
  paint?: readonly PaintMark[]; brush?: readonly BrushMark[];
}
export interface RenderResult {
  readonly version: string; readonly look: MaterialId; readonly layer: Layer;
  readonly width: number; readonly height: number; readonly seed: number;
  readonly inverted: boolean; readonly animated: false;
}
export interface Renderer {
  render(context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, options?: RenderOptions): RenderResult;
  dispose(): void;
}
export const version: string;
export const materials: readonly Readonly<{id: MaterialId; kind: string}>[];
export function createRenderer(options: {
  createCanvas(width: number, height: number): HTMLCanvasElement | OffscreenCanvas;
}): Renderer;
