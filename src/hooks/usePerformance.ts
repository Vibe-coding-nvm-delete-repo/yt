"use client";

import { useEffect, useRef, useCallback } from "react";

interface RenderInfo {
  renderCount: number;
  lastRenderTime: number;
  componentName?: string;
  rapidRenderCount: number;
  lastRapidRenderReset: number;
}

interface PerformanceMetrics {
  renderCount: number;
  averageRenderInterval: number;
  rapidRenders: number;
  mountTime: number;
  lifespan: number;
}

interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

/**
 * Development hook for monitoring component re-renders
 * Helps identify performance issues and excessive re-rendering
 */
export const useRenderTracker = (
  componentName: string, 
  options: {
    logThreshold?: number;
    rapidRenderWindowMs?: number;
    enabled?: boolean;
  } = {}
) => {
  const { 
    logThreshold = 5, 
    rapidRenderWindowMs = 1000,
    enabled = process.env.NODE_ENV === 'development'
  } = options;

  const renderInfoRef = useRef<RenderInfo>({
    renderCount: 0,
    lastRenderTime: Date.now(),
    componentName,
    rapidRenderCount: 0,
    lastRapidRenderReset: Date.now()
  });
  
  const info = renderInfoRef.current;
  
  if (enabled) {
    const now = Date.now();
    info.renderCount++;
    
    // Check for rapid renders
    const timeSinceLastRender = now - info.lastRenderTime;
    if (timeSinceLastRender < 100) { // Less than 100ms between renders
      info.rapidRenderCount++;
    }
    
    // Reset rapid render counter if window has passed
    if (now - info.lastRapidRenderReset > rapidRenderWindowMs) {
      info.rapidRenderCount = 0;
      info.lastRapidRenderReset = now;
    }
    
    info.lastRenderTime = now;
  }

  useEffect(() => {
    if (!enabled) return;
    
    const now = Date.now();
    const timeSinceLastRender = now - info.lastRenderTime;
    
    // Log if too many renders in short time
    if (info.rapidRenderCount > logThreshold) {
      console.warn(
        `⚠️  [Performance] Excessive re-renders detected in ${componentName}:\n` +
        `   • Rapid renders: ${info.rapidRenderCount} in ${rapidRenderWindowMs}ms\n` +
        `   • Total renders: ${info.renderCount}\n` +
        `   • Last interval: ${timeSinceLastRender}ms\n` +
        `   • Consider optimizing with useMemo, useCallback, or React.memo`
      );
    }
  });
  
  // Reset counter periodically
  useEffect(() => {
    if (!enabled) return;
    
    const interval = setInterval(() => {
      info.renderCount = 0;
      info.rapidRenderCount = 0;
      info.lastRapidRenderReset = Date.now();
    }, 10000); // Reset every 10 seconds
    
    return () => clearInterval(interval);
  }, [info, enabled]);

  // Return performance metrics for debugging
  const getMetrics = useCallback((): PerformanceMetrics | null => {
    if (!enabled) return null;
    
    const now = Date.now();
    return {
      renderCount: info.renderCount,
      averageRenderInterval: info.renderCount > 1 
        ? (now - info.lastRapidRenderReset) / info.renderCount 
        : 0,
      rapidRenders: info.rapidRenderCount,
      mountTime: info.lastRapidRenderReset,
      lifespan: now - info.lastRapidRenderReset
    };
  }, [enabled, info]);

  return { getMetrics };
};

/**
 * Hook to measure component mount/unmount performance
 */
export const useComponentLifecycle = (
  componentName: string,
  options: {
    logMount?: boolean;
    logUnmount?: boolean;
    enabled?: boolean;
  } = {}
) => {
  const { 
    logMount = true, 
    logUnmount = true,
    enabled = process.env.NODE_ENV === 'development'
  } = options;

  const mountTimeRef = useRef<number>(Date.now());
  const metricsRef = useRef<PerformanceMetrics | null>(null);
  
  useEffect(() => {
    if (!enabled) return;
    
    const mountTime = Date.now();
    mountTimeRef.current = mountTime;
    
    if (logMount) {
      console.warn(`🔧 [Lifecycle] ${componentName} mounted at ${new Date(mountTime).toLocaleTimeString()}`);
    }
    
    return () => {
      const unmountTime = Date.now();
      const lifespan = unmountTime - mountTimeRef.current;
      
      metricsRef.current = {
        renderCount: 0, // Not tracked here
        averageRenderInterval: 0,
        rapidRenders: 0,
        mountTime: mountTimeRef.current,
        lifespan
      };
      
      if (logUnmount) {
        console.warn(
          `🔧 [Lifecycle] ${componentName} unmounted after ${lifespan}ms ` +
          `(${new Date(unmountTime).toLocaleTimeString()})`
        );
      }
    };
  }, [componentName, logMount, logUnmount, enabled]);

  const getLifecycleMetrics = useCallback(() => {
    if (!enabled) return null;
    
    const now = Date.now();
    return {
      mountTime: mountTimeRef.current,
      currentLifespan: now - mountTimeRef.current,
      lastKnownLifespan: metricsRef.current?.lifespan || 0
    };
  }, [enabled]);

  return { getLifecycleMetrics };
};

/**
 * Hook for measuring operation performance (API calls, computations, etc.)
 */
export const useOperationTimer = (
  enabled: boolean = process.env.NODE_ENV === 'development'
) => {
  const timersRef = useRef<Map<string, number>>(new Map());

  const startTimer = useCallback((operationName: string) => {
    if (!enabled) return;
    timersRef.current.set(operationName, performance.now());
  }, [enabled]);

  const endTimer = useCallback((operationName: string, logResult: boolean = true) => {
    if (!enabled) return 0;
    
    const startTime = timersRef.current.get(operationName);
    if (!startTime) {
      console.warn(`Timer '${operationName}' was not started`);
      return 0;
    }

    const duration = performance.now() - startTime;
    timersRef.current.delete(operationName);

    if (logResult) {
      const emoji = duration > 1000 ? '🐌' : duration > 500 ? '⏳' : '⚡';
      console.warn(`${emoji} [Performance] ${operationName}: ${duration.toFixed(2)}ms`);
    }

    return duration;
  }, [enabled]);

  const timeOperation = useCallback(async <T>(
    operationName: string,
    operation: () => Promise<T> | T
  ): Promise<{ result: T; duration: number }> => {
    if (!enabled) {
      const result = await operation();
      return { result, duration: 0 };
    }

    startTimer(operationName);
    try {
      const result = await operation();
      const duration = endTimer(operationName);
      return { result, duration };
    } catch (error) {
      endTimer(operationName, false);
      console.error(`❌ [Performance] ${operationName} failed:`, error);
      throw error;
    }
  }, [enabled, startTimer, endTimer]);

  return {
    startTimer,
    endTimer,
    timeOperation
  };
};

/**
 * Hook for monitoring memory usage (experimental)
 */
export const useMemoryMonitor = (
  componentName: string,
  options: {
    interval?: number;
    logThreshold?: number;
    enabled?: boolean;
  } = {}
) => {
  const {
    interval = 5000, // Check every 5 seconds
    logThreshold = 50 * 1024 * 1024, // 50MB
    enabled = process.env.NODE_ENV === 'development'
  } = options;

  const lastMemoryRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled || !('memory' in performance)) {
      return;
    }

    const checkMemory = () => {
      const memory = (performance as { memory?: MemoryInfo }).memory;
      if (!memory) return;

      const usedJSMemory = memory.usedJSHeapSize;
      const memoryIncrease = usedJSMemory - lastMemoryRef.current;

      if (memoryIncrease > logThreshold) {
        console.warn(
          `🧠 [Memory] Significant memory increase in ${componentName}:\n` +
          `   • Current: ${(usedJSMemory / 1024 / 1024).toFixed(2)}MB\n` +
          `   • Increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB\n` +
          `   • Total heap: ${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB\n` +
          `   • Heap limit: ${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`
        );
      }

      lastMemoryRef.current = usedJSMemory;
    };

    const intervalId = setInterval(checkMemory, interval);
    checkMemory(); // Initial check

    return () => clearInterval(intervalId);
  }, [componentName, interval, logThreshold, enabled]);

  const getCurrentMemoryUsage = useCallback(() => {
    if (!enabled || !('memory' in performance)) {
      return null;
    }

    const memory = (performance as { memory?: MemoryInfo }).memory;
    if (!memory) return null;

    return {
      usedJSMemory: memory.usedJSHeapSize,
      totalJSMemory: memory.totalJSHeapSize,
      memoryLimit: memory.jsHeapSizeLimit,
      usedMB: memory.usedJSHeapSize / 1024 / 1024,
      totalMB: memory.totalJSHeapSize / 1024 / 1024,
      limitMB: memory.jsHeapSizeLimit / 1024 / 1024
    };
  }, [enabled]);

  return { getCurrentMemoryUsage };
};

/**
 * Combined performance hook that includes all monitoring capabilities
 */
export const usePerformanceMonitor = (
  componentName: string,
  options: {
    trackRenders?: boolean;
    trackLifecycle?: boolean;
    trackMemory?: boolean;
    enabled?: boolean;
  } = {}
) => {
  const {
    trackRenders = true,
    trackLifecycle = true,
    trackMemory = false, // More invasive, opt-in
    enabled = process.env.NODE_ENV === 'development'
  } = options;

  const renderTracker = useRenderTracker(componentName, { enabled: enabled && trackRenders });
  const lifecycle = useComponentLifecycle(componentName, { enabled: enabled && trackLifecycle });
  const memory = useMemoryMonitor(componentName, { enabled: enabled && trackMemory });
  const timer = useOperationTimer(enabled);

  const getAllMetrics = useCallback(() => {
    if (!enabled) return null;

    return {
      renders: renderTracker.getMetrics(),
      lifecycle: lifecycle.getLifecycleMetrics(),
      memory: memory.getCurrentMemoryUsage(),
      componentName
    };
  }, [enabled, renderTracker, lifecycle, memory, componentName]);

  return {
    ...renderTracker,
    ...lifecycle,
    ...memory,
    ...timer,
    getAllMetrics
  };
};
