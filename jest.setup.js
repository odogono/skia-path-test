require('react-native-reanimated').setUpTests();

jest.mock('@shopify/react-native-skia', () => ({
  Skia: {
    Color: jest.fn()
  }
}));
