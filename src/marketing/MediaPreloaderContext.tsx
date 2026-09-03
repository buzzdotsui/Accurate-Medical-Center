"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

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
  const [isReady, setIsReady] = useState(false);
  // Track which IDs are registered as *critical* blocking assets.
  // Only IDs added via registerAsset() contribute to the isReady gate.
  const criticalIdsRef = useRef<Set<string>>(new Set());

  // isReady fires when every CRITICAL registered asset is true.
  useEffect(() => {
    const criticalIds = Array.from(criticalIdsRef.current);
    if (criticalIds.length === 0) return;
    const allReady = criticalIds.every(id => assets[id] === true);
    if (allReady) {
      const id = setTimeout(() => setIsReady(true), 0);
      return () => clearTimeout(id);
    }
  }, [assets]);

  const registerAsset = useCallback((id: string) => {
    criticalIdsRef.current.add(id);
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
