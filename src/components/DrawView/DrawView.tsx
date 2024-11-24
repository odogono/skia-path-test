import React, { useMemo, useState } from 'react';
import { LayoutRectangle, StyleSheet } from 'react-native';

import { Canvas, Group, useCanvasRef } from '@shopify/react-native-skia';
import { GestureDetector } from 'react-native-gesture-handler';

import type { Position } from '@types';
import { DrawBoid } from './DrawBoid';
import { Trail } from './Trail';
import { useBoids } from './flock';
import { useDrawGesture } from './useDrawGesture';
import { usePaths } from './usePaths';

type DrawViewProps = {
  boidCount?: number;
};

export const DrawView = ({ boidCount = 10 }: DrawViewProps) => {
  const canvasRef = useCanvasRef();

  const [viewDims, setViewDims] = useState<LayoutRectangle>({
    width: 0,
    height: 0,
    x: 0,
    y: 0
  });

  const { paths, startPath, updatePath, endPath } = usePaths(boidCount * 2);

  // create a boid flock simulation
  const { boids } = useBoids({
    count: boidCount,
    width: viewDims.width,
    height: viewDims.height,
    maxSpeed: 10
  });

  //
  const drawBoids = useMemo(
    () =>
      boids.map((boid, index) => ({
        id: index,
        position: boid.position,
        startPath,
        updatePath,
        endPath
      })),
    [boids]
  );

  // create a gesture handler for directly drawing a path
  const gesture = useDrawGesture({ startPath, updatePath, endPath });

  return (
    <>
      <GestureDetector gesture={gesture}>
        <Canvas
          style={styles.canvas}
          ref={canvasRef}
          onLayout={(event) => {
            setViewDims(event.nativeEvent.layout);
          }}
        >
          {drawBoids.map((drawBoid) => (
            <DrawBoid key={drawBoid.id} {...drawBoid} />
          ))}
          {viewDims && (
            <Group>
              {paths.map((state) => (
                <Trail
                  key={`dt-${state.id}`}
                  {...state}
                  strokeWidth={4}
                  style='stroke'
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
