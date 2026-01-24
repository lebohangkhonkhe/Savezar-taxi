import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.savezar.taxi',
  appName: 'SaveZar',
  webDir: 'dist/public',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#DC2626',
      androidSplashResourceName: 'splash',
      showSpinner: false
    }
  },
  android: {
    backgroundColor: '#DC2626'
  }
};

export default config;
