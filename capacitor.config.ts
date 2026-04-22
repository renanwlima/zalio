import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.zalio.app',
  appName: 'Zalio',
  webDir: 'build',
  server: {
    // Permite que o app Android faça requisições para o seu domínio do Auth0.
    allowNavigation: ['dev-7tf743azyjk8acdg.us.auth0.com']
  }
};

export default config;
