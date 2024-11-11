import reactotronZustand from 'reactotron-plugin-zustand';
import Reactotron from 'reactotron-react-native';

import { store } from '@model/Store';

Reactotron.configure({
  name: 'Skia Path Test'
})
  .useReactNative({
    networking: {
      ignoreUrls: /symbolicate|127.0.0.1/
    },
    editor: false,
    errors: { veto: (stackFrame) => false },
    overlay: false
  })
  .use(
    reactotronZustand({
      stores: [{ name: 'store', store }],
      omitFunctionKeys: true
    })
  )
  .connect();
