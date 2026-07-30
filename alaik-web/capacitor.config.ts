import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'kz.alaik.app',
  appName: 'Alaik',
  webDir: 'dist',
  server: {
    // Allow the WebView to talk to the local dev API during development.
    // In production, point VITE_API_URL at the hosted API and rebuild.
    androidScheme: 'https',
    iosScheme: 'https',
  },
  ios: {
    contentInset: 'always',
  },
};

export default config;
