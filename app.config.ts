import { ConfigContext, ExpoConfig } from '@expo/config';
import * as dotenv from 'dotenv';

const IS_DEV = process.env.APP_VARIANT === 'development';

dotenv.config();


export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'skia-path-test',
  slug: 'skia-path-test',
  version: '0.0.1',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'myapp',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/images/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'net.odgn.skiapathtest',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    package: 'net.odgn.skiapathtest',
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: ['expo-router'],
  experiments: {
    typedRoutes: true,
  },
});
