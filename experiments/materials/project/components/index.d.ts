/* Hypermetapunk 0.2.0-revamp.1 · types, as documentation of window.Hypermetapunk */
type HmpThemeId =
  | "dusk"
  | "zine"
  | "contrast"
  | "rainprint"
  | "schism"
  | "steamfunk"
  | "raeverfaelt"
  | "strawberry";
interface HmpLook {
  id: HmpThemeId;
  name: string;
  light: boolean;
  motion: boolean;
  print: boolean;
  line: string;
}
interface HmpFinding {
  rule: string;
  severity: "warn" | "info";
  count: number;
  sample: string;
  fix: string;
}
interface HmpAccent {
  requested: string;
  color: string;
  onColor: string;
  adjusted: boolean;
  minimumContrast: number;
}
interface Hypermetapunk {
  version: string;
  /** Optional additive materials.js module. */
  pen?: (look?: HmpThemeId | Element) => HmpPen;
  materials?: {
    id: HmpThemeId;
    kind: string;
    renderer: "canvas-2d";
    motion: false;
  }[];
  themes: HmpLook[];
  looks: HmpLook[];
  init(): Hypermetapunk;
  theme: {
    list: HmpLook[];
    get(): HmpThemeId;
    set(id: HmpThemeId, opts?: { keep?: boolean }): HmpThemeId;
    init(): void;
  };
  accent: {
    presets(): { name: string; color: string }[];
    get(): HmpAccent | null;
    set(color: string, opts?: { keep?: boolean }): HmpAccent | null;
    reset(opts?: { keep?: boolean }): null;
  };
  still: { get(): boolean; set(on: boolean): boolean; init(): void };
  ticker(el: Element): { el: Element; pause(): void; play(): void };
  slap(frame: Element, opts?: { seed?: number }): void;
  taste: ((opts?: { root?: ParentNode; log?: boolean }) => HmpFinding[]) & {
    badge(findings?: HmpFinding[]): HTMLElement;
  };
  token(name: string, el?: Element): string;
  reducedMotion(): boolean;
}
interface Window {
  Hypermetapunk: Hypermetapunk;
}

interface HmpPaintMark {
  x: number;
  y: number;
  radius?: number;
}
interface HmpSceneOptions {
  width?: number;
  height?: number;
  detail?: number;
  rain?: number;
  backgroundLook?: HmpThemeId;
  paint?: HmpPaintMark[];
}
interface HmpTextureOptions {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  seed?: number;
  opacity?: number;
  gap?: number;
}
interface HmpPen {
  version: string;
  look: HmpThemeId;
  inks: Record<string, [number, number, number]>;
  material: {
    sky: string[];
    far: string;
    mid: string;
    land: string;
    paper: string;
    ink: string;
    red: string;
    metal: string;
    water: string;
    light: string;
    grain: number;
    kind: string;
  };
  rgb(name: string, opacity?: number): string;
  texture(
    ctx: CanvasRenderingContext2D,
    kind: "fibre" | "xerox" | "halftone" | "scanlines",
    options?: HmpTextureOptions,
  ): void;
  band(
    ctx: CanvasRenderingContext2D,
    options?: { width?: number; height?: number },
  ): void;
  sun(
    ctx: CanvasRenderingContext2D,
    options?: { x?: number; y?: number; radius?: number },
  ): void;
  gridFloor(
    ctx: CanvasRenderingContext2D,
    options?: { width?: number; height?: number; horizon?: number },
  ): void;
  chromeText(
    ctx: CanvasRenderingContext2D,
    text: string,
    options?: { x?: number; y?: number; size?: number },
  ): void;
  misregister(
    ctx: CanvasRenderingContext2D,
    text: string,
    options?: { x?: number; y?: number; size?: number },
  ): void;
  scene(
    ctx: CanvasRenderingContext2D,
    state?: { seed?: number },
    options?: HmpSceneOptions,
  ): {
    look: HmpThemeId;
    width: number;
    height: number;
    seed: number;
    renderer: "canvas-2d";
    animated: false;
  };
}

/** Optional worlds.js: paired surface/sub-T artwork, independent of simulation. */
interface HmpWorldOptions extends HmpSceneOptions {
  look?: HmpThemeId;
  layer?: "surface" | "subterrain";
  nap?: number;
  brush?: { x: number; y: number; direction: number; radius?: number }[];
  invert?: boolean;
}
interface Hypermetapunk {
  worlds?: {
    version: string;
    list: { id: HmpThemeId; name: string; material: string }[];
    draw(
      ctx: CanvasRenderingContext2D,
      state?: { seed?: number },
      options?: HmpWorldOptions,
    ): {
      version: string;
      look: HmpThemeId;
      layer: "surface" | "subterrain";
      name: string;
      width: number;
      height: number;
      inverted: boolean;
      renderer: "canvas-2d";
      animated: false;
    };
    invert(
      ctx: CanvasRenderingContext2D,
      options?: { width?: number; height?: number },
    ): {
      width: number;
      height: number;
      operation: "rgb-complement";
      alpha: "preserved";
    };
  };
}

/** R3 optional projected scenery addon; load after materials.js. Host owns play state. */
interface HypermetapunkLandmarkOptions {
  look?: string;
  layer?: "surface" | "subterrain";
  x?: number;
  y?: number;
  size?: number;
  seed?: number;
  time?: number;
  still?: boolean;
  nap?: number;
}
interface HypermetapunkLandmarks {
  readonly version: string;
  draw(
    context: CanvasRenderingContext2D,
    options?: HypermetapunkLandmarkOptions,
  ): { look: string; layer: "surface" | "subterrain"; animated: false };
  palette(
    look?: string,
    layer?: "surface" | "subterrain",
  ): {
    sky: string[];
    water: string[];
    route: string[];
    rim: string;
    land: string[];
    ink: string;
    light: string;
    accent: string;
    mist: string;
  };
  horizon(
    context: CanvasRenderingContext2D,
    options: {
      look?: string;
      layer?: "surface" | "subterrain";
      width?: number;
      height?: number;
      time?: number;
      still?: boolean;
    },
  ): void;
}

interface Hypermetapunk {
  landmarks?: HypermetapunkLandmarks;
}
