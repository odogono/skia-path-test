import { Suspense, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { Slot } from '@helpers/router';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const Loading = () => (
  <View style={LoadingStyle.container}>
    <Text>Loading...</Text>
  </View>
);

const LoadingStyle = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const RootLayout = () => {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <Suspense fallback={<Loading />}>
      <Slot />
    </Suspense>
  );
};

export default RootLayout;
