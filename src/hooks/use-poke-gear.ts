'use client';

import { useRef, useEffect, useState } from 'react';
import { Application, Text, Graphics, Container } from 'pixi.js';
import { gsap } from 'gsap';
import { Howl } from 'howler';
import type { PokeGearLibs } from '@/types/dex-arcade';

export const usePokeGear = (canvasRef: React.RefObject<HTMLDivElement>) => {
  const [isInitialized, setIsInitialized] = useState(false);
  
  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }
    
    // This effect creates and manages its own resources.
    let app: Application;
    let bootSound: Howl;
    let tl: gsap.core.Timeline;

    const setup = async () => {
      // Check if the component unmounted before we could finish setup
      const currentCanvas = canvasRef.current;
      if (!currentCanvas) return;

      // 1. Create all resources
      app = new Application();
      
      bootSound = new Howl({
        src: ['/audio/boot.mp3', '/audio/boot.ogg'],
        volume: 0.5,
        onerror: (id, err) => console.log('Howler error:', err),
      });

      tl = gsap.timeline({
        onComplete: () => {
          setIsInitialized(true);
        },
      });

      // 2. Asynchronously initialize the Pixi app
      await app.init({
        resizeTo: currentCanvas,
        backgroundAlpha: 0,
        antialias: true,
      });

      // 3. Check if component unmounted during async init
      if (!canvasRef.current) {
        // If it unmounted, we need to clean up the resources we already created
        tl.kill();
        bootSound.stop();
        app.destroy(true, true);
        return;
      }

      // 4. Add canvas to DOM and build the scene
      currentCanvas.appendChild(app.canvas);

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
      progressBar.position.set((currentCanvas.offsetWidth - barWidth) / 2, currentCanvas.offsetHeight * 0.7);
      bootContainer.addChild(progressBar);
      
      const progressFill = new Graphics();
      progressFill.rect(2, 2, 0, barHeight - 4).fill({color: '#306230'});
      progressBar.addChild(progressFill);

      // 5. Start animations
      bootSound.play();
      tl.to(bootText, { alpha: 1, duration: 1, delay: 0.5 })
        .to(progressFill, { width: barWidth - 4, duration: 2, ease: 'power1.inOut' }, '-=0.5')
        .to(bootContainer, { alpha: 0, duration: 0.5, onComplete: () => bootContainer.destroy() });
    };

    setup();

    // The cleanup function closes over the resources created in this effect run.
    return () => {
      // The `app` variable and others will be undefined if setup() didn't run or bailed early.
      // The checks prevent errors if cleanup runs before setup is complete.
      tl?.kill();
      bootSound?.stop();
      app?.destroy(true, true);
      setIsInitialized(false);
    };
  }, [canvasRef]);

  return { isInitialized };
};
