import { registerRootComponent } from 'expo';

import App from './app';

if (__DEV__) {
  require('./ReactotronConfig');
  console.log('Reactotron connected');
}

registerRootComponent(App);
