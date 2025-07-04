import type { Application } from 'pixi.js';
import type { Howl } from 'howler';
import type { Engine } from 'matter-js';
import type { gsap } from 'gsap';

export interface PokeGearLibs {
  pixiApp: Application | null;
  howler: Howl | null;
  matterEngine: Engine | null;
  gsapTimeline: gsap.core.Timeline | null;
}

export interface AppIcon {
  id: string;
  name: string;
  unlocked: boolean;
  component: React.ComponentType; // Or a string identifier
}
