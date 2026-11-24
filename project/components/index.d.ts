/* Hypermetapunk 0.4.0 · types, as documentation of window.Hypermetapunk */
type HmpThemeId = 'dusk' | 'zine' | 'contrast';
interface HmpLook { id: HmpThemeId; name: string; light: boolean; motion: boolean; print: boolean; line: string; }
interface HmpFinding { rule: string; severity: 'warn' | 'info'; count: number; sample: string; fix: string; }
type HmpInk = [number, number, number] | [number, number, number, number];
interface HmpPen {
  look: HmpThemeId; name: string; light: boolean;
  inks: Record<string, HmpInk>;
  rgb(name: string | HmpInk, alpha?: number): string;
  band(k: number): HmpInk;
  sky(ctx: CanvasRenderingContext2D, o: { x?: number; y?: number; w: number; h: number; steps?: number; span?: number; ease?: number; lines?: boolean }): void;
  sun(ctx: CanvasRenderingContext2D, o: { x: number; y: number; r: number; tape?: boolean; glow?: boolean }): void;
  floor(ctx: CanvasRenderingContext2D, o: { x?: number; y: number; w: number; h: number; vx?: number; t?: number; rows?: number; gap?: number; spread?: number; line?: number }): void;
  horizon(ctx: CanvasRenderingContext2D, o: { x?: number; y?: number; w: number; h: number; at?: number; sunR?: number; sunX?: number; t?: number; steps?: number; lines?: boolean; tape?: boolean }): number;
  material(ctx: CanvasRenderingContext2D, kind: 'scan' | 'halftone' | 'xerox'): CanvasPattern | null;
  grain(ctx: CanvasRenderingContext2D, o: { x?: number; y?: number; w: number; h: number; amount?: number }): void;
  chrome(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, o: { size: number; font?: string; weight?: string; align?: CanvasTextAlign }): void;
  misreg(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, o: { size: number; font?: string; weight?: string; align?: CanvasTextAlign; dx?: number; ink?: string }): void;
  /** 0.4.0 (plan C5): die-cut any drawing as a sticker, centred on (x, y). Returns the sticker's size with its keyline, or null if src has no size. */
  sticker(ctx: CanvasRenderingContext2D, src: CanvasImageSource & { width: number; height: number }, x: number, y: number, o?: { w?: number; h?: number; keyline?: number; edge?: number; slap?: number; slip?: number; angle?: number; alpha?: number; ink?: string; edgeInk?: string; slapInk?: string }): { w: number; h: number } | null;
}
/** The dusk pets' ids; the shared save stores them as 'hmp:<id>' */
type HmpPetId = 'sticker-cat' | 'static-moth' | 'two-plate-koi' | 'stamp-crab' | 'tape-bat';
interface HmpPet { id: HmpPetId; name: string; line: string; how: string; where: string; }
interface HmpPetDraw { x?: number; y?: number; size?: number; t?: number; beat?: number; look?: HmpThemeId; still?: boolean; alpha?: number; }
interface HmpPets {
  kit: 'hmp'; key: 'crossing:pets'; version: string;
  list: HmpPet[];
  /** id with or without the 'hmp:' prefix */
  has(id: string): boolean;
  /** true only when newly found; writes found['hmp:' + id] = Date.now() into localStorage['crossing:pets'] and sends a 'hmp:pet' window event */
  find(id: string): boolean;
  count(): number;
  /** the whole family from the same save: Storeybrook (of 7), Depthfield (of 5), Hypermetapunk (of 5) */
  total(): { sb: number; df: number; hmp: number; all: number };
  /** centred on (x, y); size ≈ its height in CSS px; beat 0..1 jumps to 1 on each beat; still: no motion at all. Saves and restores ctx. */
  draw(ctx: CanvasRenderingContext2D, id: string, o?: HmpPetDraw): boolean;
}
interface HmpAccent { requested: string; color: string; onColor: string; adjusted: boolean; minimumContrast: number; }
interface Hypermetapunk {
  version: string;
  themes: HmpLook[];
  looks: HmpLook[];
  /** from the add-on components/pen.js (0.3.0), which also works without bundle.js */
  pen?(look?: HmpThemeId | Element, opts?: { still?: boolean }): HmpPen;
  penVersion?: string;
  /** from the add-on components/pets.js (0.4.0), which also works without bundle.js */
  pets?: HmpPets;
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
