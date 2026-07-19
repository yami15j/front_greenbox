import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'greenbox',
  webDir: 'www',
  plugins: {
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ['google.com']
    },
    StatusBar: {
      overlaysWebView: false,
      backgroundColor: '#f6faf8',
      style: 'DARK'
    }
  }
};

export default config;
