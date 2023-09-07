import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.raven.app',
  appName: 'Raven',
  webDir: 'dist',
  bundledWebRuntime: false,
  "plugins": {
    "CapacitorCookies": {
      "enabled": true,
    },
    "CapacitorHttp": {
      enabled: true
    },
  }
};

export default config;
