'use client';

import { useRef, useEffect, useState } from 'react';
import { Application, Text, Graphics, Container } from 'pixi.js';
import { gsap } from 'gsap';
import { Howl } from 'howler';
import type { PokeGearLibs } from '@/types/dex-arcade';

export const usePokeGear = (canvasRef: React.RefObject<HTMLDivElement>) => {
  const pixiAppRef = useRef<Application | null>(null);
  const howlerRef = useRef<Howl | null>(null);
  const gsapTimelineRef = useRef<gsap.core.Timeline | null>(null);
  
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Only run if the canvas is ready and the app hasn't been created yet.
    if (!canvasRef.current || pixiAppRef.current) return;

    let app: Application;

    const init = async () => {
      app = new Application();
      pixiAppRef.current = app; // Store instance in ref

      await app.init({
        resizeTo: canvasRef.current!,
        backgroundAlpha: 0,
        antialias: true,
      });
      canvasRef.current!.appendChild(app.canvas);
      
      const bootSound = new Howl({
        src: ['/audio/boot.mp3', '/audio/boot.ogg'],
        volume: 0.5,
        onerror: (id, err) => console.log('Howler error:', err),
      });
      howlerRef.current = bootSound;

      // --- Create Boot Sequence ---
      const bootContainer = new Container();
      app.stage.addChild(bootContainer);

      const screenBg = new Graphics();
      screenBg.rect(0, 0, app.screen.width, app.screen.height).fill({color: '#8bac0f'});
      bootContainer.addChild(screenBg);

      const bootText = new Text({
        text: 'DEX ARCADE v1.0',
        style: {
          fontFamily: '"Press Start 2P"',
          fontSize: 24,
          fill: '#306230',
          align: 'center',
          wordWrap: true,
          wordWrapWidth: app.screen.width - 40,
        }
      });
      bootText.anchor.set(0.5);
      bootText.position.set(app.screen.width / 2, app.screen.height / 2);
      bootText.alpha = 0;
      bootContainer.addChild(bootText);

      const progressBar = new Graphics();
      const barWidth = app.screen.width * 0.6;
      const barHeight = 16;
      progressBar.rect(0, 0, barWidth, barHeight).stroke({ width: 2, color: '#306230' });
      progressBar.position.set((app.screen.width - barWidth) / 2, app.screen.height * 0.7);
      bootContainer.addChild(progressBar);
      
      const progressFill = new Graphics();
      progressFill.rect(2, 2, 0, barHeight - 4).fill({color: '#306230'});
      progressBar.addChild(progressFill);

      const tl = gsap.timeline({
        onComplete: () => {
          setIsInitialized(true);
          // Transition to main menu would happen here
        },
      });
      gsapTimelineRef.current = tl;

      bootSound.play();

      tl.to(bootText, { alpha: 1, duration: 1, delay: 0.5 })
        .to(progressFill, { width: barWidth - 4, duration: 2, ease: 'power1.inOut' }, '-=0.5')
        .to(bootContainer, { alpha: 0, duration: 0.5, onComplete: () => bootContainer.destroy() });
    };

    init();

    // Cleanup function
    return () => {
      gsapTimelineRef.current?.kill();
      howlerRef.current?.stop();
      if (pixiAppRef.current) {
        pixiAppRef.current.destroy(true, true);
        pixiAppRef.current = null;
      }
      setIsInitialized(false);
    };
  }, [canvasRef]);

  return { isInitialized };
};
