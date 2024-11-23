import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { FiberProvider } from 'its-fine';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSharedValue } from 'react-native-reanimated';

import { DrawView } from '@components/DrawView/DrawView';
import { BoidSimulation } from '@components/DrawView/flock';
import { ReText } from '@components/ReText';
import {
  debugMsg2,
  debugMsg3,
  debugMsg4,
  debugMsg5,
  debugMsg
} from '@helpers/global';

export const Draw = () => {
  return (
    <FiberProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.container}>
          {/* <DrawView /> */}
          <BoidSimulation />

          {/* <View style={styles.sliderContainer}>
            <ReText style={styles.debugText} text={debugMsg} />
            <ReText style={styles.debugText} text={debugMsg2} />
            <ReText style={styles.debugText} text={debugMsg3} />
            <ReText style={styles.debugText} text={debugMsg4} />
            <ReText style={styles.debugText} text={debugMsg5} />
          </View> */}
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
    backgroundColor: '#161e27'
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

export default Draw;
