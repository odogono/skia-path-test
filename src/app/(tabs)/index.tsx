import { StyleSheet, View } from 'react-native';

import { FiberProvider } from 'its-fine';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSharedValue } from 'react-native-reanimated';

import { Debug } from '@components/Debug/Debug';
import { PathView } from '@components/PathView/PathView';
import { WorldCanvas } from '@components/WorldCanvas/WorldCanvas';
import { Slider } from '@miblanchard/react-native-slider';
import { StoreProvider } from '@model/StoreProvider/StoreProvider';

export const Path = () => {
  const head = useSharedValue(0);

  const minValue = -1;
  const maxValue = 1;
  const step = 0;

  return (
    <FiberProvider>
      <GestureHandlerRootView style={styles.gestureContainer}>
        <View style={styles.container}>
          <StoreProvider>
            <WorldCanvas>
              <PathView head={head} />
            </WorldCanvas>

            <View style={styles.sliderContainer}>
              <Debug />
              {/* <Slider
                minimumValue={minValue}
                maximumValue={maxValue}
                value={head.value}
                step={step}
                trackMarks={[minValue, 0, maxValue]}
                renderTrackMarkComponent={() => (
                  <View style={styles.trackMark} />
                )}
                onValueChange={(value) => (head.value = value[0])}
              /> */}
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
    backgroundColor: '#161e27'
  },
  gestureContainer: {
    flex: 1
  },
  sliderContainer: {
    position: 'absolute',
    bottom: 46,
    width: '80%'
  },
  trackMark: {
    width: 4,
    height: 8,
    backgroundColor: '#fff'
  }
});

export default Path;
