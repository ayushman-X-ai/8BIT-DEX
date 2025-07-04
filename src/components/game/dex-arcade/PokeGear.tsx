'use client';

import React, { useRef } from 'react';
import { usePokeGear } from '@/hooks/use-poke-gear';
import '@/styles/dex-arcade.css';

const PokeGear = () => {
  const screenRef = useRef<HTMLDivElement>(null);
  const { isInitialized } = usePokeGear(screenRef);

  return (
    <div className="pokegear-shell font-body">
      <div className="pokegear-screen-bezel">
        <div ref={screenRef} className="pokegear-screen">
          {/* Pixi.js canvas will be injected here */}
        </div>
      </div>
      <div className="pokegear-controls">
        <div className="pokegear-dpad" />
        <div className="pokegear-buttons">
          <button className="pokegear-button b-button" aria-label="B Button">B</button>
          <button className="pokegear-button a-button" aria-label="A Button">A</button>
        </div>
      </div>
    </div>
  );
};

export default PokeGear;
