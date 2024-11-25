import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';

import { Canvas, Group, useCanvasRef } from '@shopify/react-native-skia';
import { GestureDetector } from 'react-native-gesture-handler';

import { useViewDims } from '@helpers/useViewDims';
import { useBoids } from './Boids/useBoids';
import { DrawBoid } from './DrawBoid';
import { Trail } from './Trail';
import { useDrawGesture } from './useDrawGesture';
import { usePaths } from './usePaths';

type DrawViewProps = {
  boidCount?: number;
};

export const DrawView = ({ boidCount = 10 }: DrawViewProps) => {
  const canvasRef = useCanvasRef();

  const { viewDims, setViewDims } = useViewDims();

  const { paths, startPath, updatePath, endPath } = usePaths(boidCount * 2);

  // create a boid flock simulation
  const { boids } = useBoids({
    count: boidCount,
    width: viewDims.width,
    height: viewDims.height,
    maxSpeed: 13
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
