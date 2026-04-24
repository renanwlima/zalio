import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rwl.zalio',
  appName: 'Zalio',
  webDir: 'build',
  server: {
    url: 'https://renanwlima.github.io/zalio',
    allowNavigation: [
      'dev-7tf743azyjk8acdg.us.auth0.com',
      'renanwlima.github.io'
    ]
  }
};

export default config;
