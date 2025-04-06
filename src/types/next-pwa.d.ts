declare module 'next-pwa' {
  import { NextConfig } from 'next';
  
  interface RuntimeCachingOptions {
    cacheName?: string;
    expiration?: {
      maxEntries?: number;
      maxAgeSeconds?: number;
    };
    networkTimeoutSeconds?: number;
    matchOptions?: {
      ignoreSearch?: boolean;
      ignoreVary?: boolean;
    };
    cacheableResponse?: {
      statuses: number[];
      headers?: Record<string, string>;
    };
  }

  interface PWAConfig {
    dest?: string;
    disable?: boolean;
    register?: boolean;
    scope?: string;
    sw?: string;
    skipWaiting?: boolean;
    runtimeCaching?: Array<{
      urlPattern: RegExp | string;
      handler: 'CacheFirst' | 'CacheOnly' | 'NetworkFirst' | 'NetworkOnly' | 'StaleWhileRevalidate';
      options?: RuntimeCachingOptions;
    }>;
  }

  function withPWA(config: PWAConfig): (nextConfig: NextConfig) => NextConfig;
  export = withPWA;
} 