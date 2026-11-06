/* Hypermetapunk 0.1.2 · types, as documentation of window.Hypermetapunk */
type HmpThemeId = 'dusk' | 'zine' | 'contrast';
interface HmpLook { id: HmpThemeId; name: string; light: boolean; motion: boolean; print: boolean; line: string; }
interface HmpFinding { rule: string; severity: 'warn' | 'info'; count: number; sample: string; fix: string; }
interface HmpAccent { requested: string; color: string; onColor: string; adjusted: boolean; minimumContrast: number; }
interface Hypermetapunk {
  version: string;
  themes: HmpLook[];
  looks: HmpLook[];
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
