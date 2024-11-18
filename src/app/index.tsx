import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { FiberProvider } from 'its-fine';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSharedValue } from 'react-native-reanimated';

import { PathView } from '@components/PathView/PathView';
import { ReText } from '@components/ReText';
import { WorldCanvas } from '@components/WorldCanvas/WorldCanvas';
import {
  debugMsg2,
  debugMsg3,
  debugMsg4,
  debugMsg5,
  debugMsg
} from '@helpers/global';
import { Slider } from '@miblanchard/react-native-slider';
import { StoreProvider } from '@model/StoreProvider/StoreProvider';

export const Index = () => {
  const t = useSharedValue(0);

  const minValue = -1;
  const maxValue = 1;
  const step = 0;

  return (
    <FiberProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.container}>
          <StoreProvider>
            <WorldCanvas>
              <PathView t={t} />
            </WorldCanvas>

            <View style={styles.sliderContainer}>
              <ReText style={styles.debugText} text={debugMsg} />
              <ReText style={styles.debugText} text={debugMsg2} />
              <ReText style={styles.debugText} text={debugMsg3} />
              <ReText style={styles.debugText} text={debugMsg4} />
              <ReText style={styles.debugText} text={debugMsg5} />
              <Slider
                minimumValue={minValue}
                maximumValue={maxValue}
                value={t.value}
                step={step}
                trackMarks={[minValue, 0, maxValue]}
                renderTrackMarkComponent={({ value }) => (
                  <View style={styles.trackMark} />
                )}
                onValueChange={(value) => (t.value = value[0])}
              />
            </View>
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
  },
  sliderContainer: {
    position: 'absolute',
    bottom: 46,
    width: '80%'
  },
  debugText: {
    color: '#fff'
  },
  trackMark: {
    width: 4,
    height: 8,
    backgroundColor: '#fff'
  }
});

export default Index;
