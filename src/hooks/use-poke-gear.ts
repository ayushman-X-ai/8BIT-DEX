'use client';

import { useRef, useEffect, useState } from 'react';
import { Application, Text, Graphics, Container } from 'pixi.js';
import { gsap } from 'gsap';
import { Howl } from 'howler';
import type { AppIcon } from '@/types/dex-arcade';

export const usePokeGear = (canvasRef: React.RefObject<HTMLDivElement>) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const appRef = useRef<Application | null>(null);
  const bootSoundRef = useRef<Howl | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (!canvasRef.current || appRef.current) {
      return;
    }

    const createHomeScreen = (app: Application) => {
        const homeContainer = new Container();
        app.stage.addChild(homeContainer);

        const apps: AppIcon[] = [
            { id: 'radar', name: 'PokéRadar', unlocked: true },
            { id: 'map', name: 'Map', unlocked: true },
            { id: 'radio', name: 'Radio', unlocked: false },
            { id: 'phone', name: 'Phone', unlocked: false },
        ];

        const iconSize = app.screen.width / 4;
        const padding = 15;
        const columns = 3;
        const iconAndPadding = iconSize + padding;
        const startX = (app.screen.width - (columns * iconAndPadding - padding)) / 2;
        const startY = 60;

        apps.forEach((appData, index) => {
            const icon = new Container();
            icon.x = startX + (index % columns) * iconAndPadding;
            icon.y = startY + Math.floor(index / columns) * iconAndPadding;
            icon.eventMode = appData.unlocked ? 'static' : 'none';
            icon.cursor = appData.unlocked ? 'pointer' : 'default';

            const bg = new Graphics()
                .rect(0, 0, iconSize, iconSize)
                .fill({color: '#306230'});
            icon.addChild(bg);
            
            const placeholder = new Text({text: '?', style:{
                fontFamily: '"Press Start 2P"',
                fontSize: Math.floor(iconSize * 0.5),
                fill: '#9bbc0f',
            }});
            placeholder.anchor.set(0.5);
            placeholder.position.set(iconSize / 2, iconSize / 2 - 5);
            icon.addChild(placeholder);


            const label = new Text({text: appData.name, style: {
                fontFamily: '"Press Start 2P"',
                fontSize: Math.floor(iconSize * 0.1),
                fill: '#306230',
                align: 'center',
                wordWrap: true,
                wordWrapWidth: iconSize,
            }});
            label.anchor.set(0.5, 0);
            label.position.set(iconSize / 2, iconSize - Math.floor(iconSize * 0.2));
            icon.addChild(label);
            
            if (!appData.unlocked) {
                icon.alpha = 0.5;
                const lock = new Text({text: 'LOCKED', style: {
                    fontFamily: '"Press Start 2P"',
                    fontSize: Math.floor(iconSize * 0.15),
                    fill: '#8bac0f',
                }});
                lock.anchor.set(0.5);
                lock.position.set(iconSize / 2, iconSize / 2);
                lock.rotation = -0.2;
                icon.addChild(lock);
            }

            homeContainer.addChild(icon);

            if (appData.unlocked) {
                icon.on('pointerover', () => {
                    gsap.to(icon.scale, { x: 1.05, y: 1.05, duration: 0.2 });
                });
                icon.on('pointerout', () => {
                    gsap.to(icon.scale, { x: 1, y: 1, duration: 0.2 });
                });
            }
        });

        const headerText = new Text({text: 'MAIN MENU', style: {
            fontFamily: '"Press Start 2P"',
            fontSize: 16,
            fill: '#306230',
        }});
        headerText.anchor.set(0.5);
        headerText.position.set(app.screen.width / 2, 30);
        homeContainer.addChild(headerText);

        homeContainer.alpha = 0;
        gsap.to(homeContainer, { alpha: 1, duration: 0.5 });
    };

    const setup = async () => {
      const currentCanvas = canvasRef.current;
      if (!currentCanvas) return;

      const app = new Application();
      appRef.current = app;

      bootSoundRef.current = new Howl({
        src: ['/audio/boot.mp3', '/audio/boot.ogg'],
        volume: 0.5,
        onerror: (id, err) => console.log('Howler error:', err),
      });

      timelineRef.current = gsap.timeline({
        onComplete: () => {
          setIsInitialized(true);
          if (appRef.current) {
            createHomeScreen(appRef.current);
          }
        },
      });

      await app.init({
        resizeTo: currentCanvas,
        backgroundAlpha: 0,
        antialias: true,
      });

      if (!canvasRef.current) {
        app.destroy(true, true);
        appRef.current = null;
        return;
      }

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
      progressBar.position.set((app.screen.width - barWidth) / 2, app.screen.height * 0.7);
      bootContainer.addChild(progressBar);
      
      const progressFill = new Graphics();
      progressFill.rect(2, 2, 0, barHeight - 4).fill({color: '#306230'});
      progressBar.addChild(progressFill);

      bootSoundRef.current.play();
      timelineRef.current
        .to(bootText, { alpha: 1, duration: 1, delay: 0.5 })
        .to(progressFill, { width: barWidth - 4, duration: 2, ease: 'power1.inOut' }, '-=0.5')
        .to(bootContainer, { alpha: 0, duration: 0.5, onComplete: () => bootContainer.destroy() });
    };

    setup();

    return () => {
      timelineRef.current?.kill();
      bootSoundRef.current?.stop();
      if (appRef.current) {
        appRef.current.destroy(true, true);
        appRef.current = null;
      }
      setIsInitialized(false);
    };
  }, [canvasRef]);

  return { isInitialized };
};
