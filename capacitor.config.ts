import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sobekplay.app',
  appName: 'Sobek Play',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;