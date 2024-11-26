import { StyleSheet, View } from 'react-native';

import { FiberProvider } from 'its-fine';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { DrawView } from '@components/DrawView/DrawView';

export const Draw = () => {
  return (
    <FiberProvider>
      <GestureHandlerRootView style={styles.gestureContainer}>
        <View style={styles.container}>
          <DrawView />
          {/* <BoidSimulation count={50} /> */}
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
  }
});

export default Draw;
