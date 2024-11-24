/* eslint-disable react-compiler/react-compiler */
import { useMemo } from 'react';

import { Gesture } from 'react-native-gesture-handler';
import { useSharedValue } from 'react-native-reanimated';

import type { Position } from '@types';
import { useBoids } from './flock';
import { usePaths } from './usePaths';

export const useDrawGesture = (viewDims: Position | null) => {
  const boidCount = 7;
  const pathInUseIndex = useSharedValue(0);
  const { paths, startPath, updatePath, endPath } = usePaths(boidCount * 2);

  const { boids } = useBoids({
    count: boidCount,
    width: viewDims?.[0] ?? 0,
    height: viewDims?.[1] ?? 0,
    maxSpeed: 10
  });

  const drawBoids = useMemo(() => {
    const result = boids.map((boid, index) => ({
      id: index,
      position: boid.position,
      startPath,
      updatePath,
      endPath
    }));

    return result;
  }, [boids]);

  const pan = Gesture.Pan()
    .onStart((g) => {
      pathInUseIndex.value = startPath(g);
    })
    .onUpdate((g) => {
      updatePath(pathInUseIndex.value, g);
    })
    .onEnd(() => {
      endPath(pathInUseIndex.value);
    })
    .minDistance(1);

  const gesture = Gesture.Simultaneous(pan);

  return { gesture, paths, drawBoids };
};
