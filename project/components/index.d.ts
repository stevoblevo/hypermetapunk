/* Hypermetapunk 0.3.0 · types, as documentation of window.Hypermetapunk */
type HmpThemeId = 'dusk' | 'zine' | 'contrast';
interface HmpLook { id: HmpThemeId; name: string; light: boolean; motion: boolean; print: boolean; line: string; }
interface HmpFinding { rule: string; severity: 'warn' | 'info'; count: number; sample: string; fix: string; }
type HmpInk = [number, number, number] | [number, number, number, number];
interface HmpPen {
  look: HmpThemeId; name: string; light: boolean;
  inks: Record<string, HmpInk>;
  rgb(name: string | HmpInk, alpha?: number): string;
  band(k: number): HmpInk;
  sky(ctx: CanvasRenderingContext2D, o: { x?: number; y?: number; w: number; h: number; steps?: number; span?: number; lines?: boolean }): void;
  sun(ctx: CanvasRenderingContext2D, o: { x: number; y: number; r: number; tape?: boolean; glow?: boolean }): void;
  floor(ctx: CanvasRenderingContext2D, o: { x?: number; y: number; w: number; h: number; vx?: number; t?: number; rows?: number; gap?: number; spread?: number; line?: number }): void;
  horizon(ctx: CanvasRenderingContext2D, o: { x?: number; y?: number; w: number; h: number; at?: number; sunR?: number; sunX?: number; t?: number; steps?: number; lines?: boolean; tape?: boolean }): number;
  material(ctx: CanvasRenderingContext2D, kind: 'scan' | 'halftone' | 'xerox'): CanvasPattern | null;
  grain(ctx: CanvasRenderingContext2D, o: { x?: number; y?: number; w: number; h: number; amount?: number }): void;
  chrome(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, o: { size: number; font?: string; weight?: string; align?: CanvasTextAlign }): void;
  misreg(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, o: { size: number; font?: string; weight?: string; align?: CanvasTextAlign; dx?: number; ink?: string }): void;
}
interface HmpAccent { requested: string; color: string; onColor: string; adjusted: boolean; minimumContrast: number; }
interface Hypermetapunk {
  version: string;
  themes: HmpLook[];
  looks: HmpLook[];
  /** from the add-on components/pen.js (0.3.0), which also works without bundle.js */
  pen?(look?: HmpThemeId | Element, opts?: { still?: boolean }): HmpPen;
  penVersion?: string;
  init(): Hypermetapunk;
  theme: { list: HmpLook[]; get(): HmpThemeId; set(id: HmpThemeId, opts?: { keep?: boolean }): HmpThemeId; init(): void };
  accent: { presets(): { name: string; color: string }[]; get(): HmpAccent | null; set(color: string, opts?: { keep?: boolean }): HmpAccent | null; reset(opts?: { keep?: boolean }): null };
  still: { get(): boolean; set(on: boolean): boolean; init(): void };
  ticker(el: Element): { el: Element; pause(): void; play(): void };
  slap(frame: Element, opts?: { seed?: number }): void;
  taste: ((opts?: { root?: ParentNode; log?: boolean }) => HmpFinding[]) & { badge(findings?: HmpFinding[]): HTMLElement };
  token(name: string, el?: Element): string;
  reducedMotion(): boolean;
}
interface Window { Hypermetapunk: Hypermetapunk; }
