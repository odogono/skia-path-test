import Reactotron from "reactotron-react-native";

Reactotron.configure({
  name: 'Skia Path Test',
}) // controls connection & communication settings
  .useReactNative({
    networking: {
      ignoreUrls: /symbolicate|127.0.0.1/,
    },
    editor: false,
    errors: { veto: stackFrame => false },
    overlay: false,
  })
  .connect(); // let's connect!