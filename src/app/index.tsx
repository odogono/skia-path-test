import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { FiberProvider } from 'its-fine';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSharedValue } from 'react-native-reanimated';

import { PathView } from '@components/PathView';
import Slider from '@components/Slider';
import { WorldCanvas } from '@components/WorldCanvas/WorldCanvas';
import { StoreProvider } from '@model/StoreProvider/StoreProvider';

export const Index = () => {
  return (
    <FiberProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.container}>
          <StoreProvider>
            <WorldCanvas>
              <PathView />
            </WorldCanvas>
          </StoreProvider>
        </View>
      </GestureHandlerRootView>
    </FiberProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#444'
  }
});

export default Index;
