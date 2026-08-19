"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

interface MediaPreloaderContextType {
  registerAsset: (id: string) => void;
  setAssetReady: (id: string) => void;
  isReady: boolean;
}

const MediaPreloaderContext = createContext<MediaPreloaderContextType | null>(null);

export function useMediaPreloader() {
  const context = useContext(MediaPreloaderContext);
  if (!context) {
    throw new Error("useMediaPreloader must be used within MediaPreloaderProvider");
  }
  return context;
}

export function MediaPreloaderProvider({ children }: { children: React.ReactNode }) {
  const [assets, setAssets] = useState<Record<string, boolean>>({});
  
  // We determine readiness based on all registered priority assets being true
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const keys = Object.keys(assets);
    if (keys.length > 0 && keys.every(key => assets[key])) {
      const id = setTimeout(() => setIsReady(true), 0);
      return () => clearTimeout(id);
    }
  }, [assets]);

  const registerAsset = useCallback((id: string) => {
    setAssets(prev => {
      if (prev[id] !== undefined) return prev;
      return { ...prev, [id]: false };
    });
  }, []);

  const setAssetReady = useCallback((id: string) => {
    setAssets(prev => {
      if (prev[id] === true) return prev;
      return { ...prev, [id]: true };
    });
  }, []);

  return (
    <MediaPreloaderContext.Provider value={{ registerAsset, setAssetReady, isReady }}>
      {children}
    </MediaPreloaderContext.Provider>
  );
}
