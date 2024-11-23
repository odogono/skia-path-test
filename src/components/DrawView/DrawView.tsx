import React, { useState } from 'react';
import { StyleSheet } from 'react-native';

import { Canvas, Group, useCanvasRef } from '@shopify/react-native-skia';
import { GestureDetector } from 'react-native-gesture-handler';

import { createLogger } from '@helpers/log';
import type { Position } from '@types';
import { Trail } from './Trail';
import { useDrawGesture } from './useDrawGesture';

const log = createLogger('DrawView');

export const DrawView = () => {
  const canvasRef = useCanvasRef();
  const { gesture, paths } = useDrawGesture();
  const [viewDims, setViewDims] = useState<Position | null>(null);

  return (
    <>
      <GestureDetector gesture={gesture}>
        <Canvas
          style={styles.canvas}
          ref={canvasRef}
          onLayout={(event) => {
            const { width, height } = event.nativeEvent.layout;
            setViewDims([width, height]);
          }}
        >
          {viewDims && (
            <Group>
              {paths.map((state) => (
                <Trail
                  key={`dt-${state.id}`}
                  {...state}
                  strokeWidth={5}
                  style='stroke'
                  color='lightblue'
                />
              ))}
            </Group>
          )}
        </Canvas>
      </GestureDetector>
    </>
  );
};

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
    width: '100%'
  }
});
