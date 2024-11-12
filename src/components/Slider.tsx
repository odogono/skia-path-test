import React, { useState } from 'react';
import {
  Animated,
  Dimensions,
  PanResponder,
  StyleSheet,
  Text,
  View
} from 'react-native';

const Slider = ({
  minimumValue = 0,
  maximumValue = 100,
  step = 1,
  onValueChange,
  initialValue = 0,
  width = Dimensions.get('window').width - 40
}) => {
  const [value, setValue] = useState(initialValue);
  const position = new Animated.Value(
    ((initialValue - minimumValue) / (maximumValue - minimumValue)) * width
  );

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      let newX = gestureState.moveX;
      // Restrict movement within slider bounds
      newX = Math.min(Math.max(0, newX), width);

      // Calculate value based on position
      const newValue =
        minimumValue + (newX / width) * (maximumValue - minimumValue);
      // Round to nearest step
      const steppedValue = Math.round(newValue / step) * step;

      position.setValue(newX - 15);
      setValue(steppedValue);
      onValueChange && onValueChange(steppedValue);
    }
  });

  return (
    <View style={styles.container}>
      <View style={[styles.track, { width }]}>
        <Animated.View
          style={[
            styles.fill,
            {
              width: position
            }
          ]}
        />
        <Animated.View
          style={[
            styles.thumb,
            {
              transform: [{ translateX: position }, { translateY: -15 }]
            }
          ]}
          {...panResponder.panHandlers}
        />
      </View>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  track: {
    height: 4,
    backgroundColor: '#EEEEEE',
    borderRadius: 2
  },
  fill: {
    height: 4,
    backgroundColor: '#007AFF',
    borderRadius: 2
  },
  thumb: {
    position: 'absolute',
    left: -15,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 5
  },
  value: {
    marginTop: 12,
    fontSize: 16,
    color: '#333333'
  }
});

export default Slider;
