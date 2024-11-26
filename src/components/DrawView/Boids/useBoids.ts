import { useMemo } from 'react';

import { FrameInfo, useFrameCallback } from 'react-native-reanimated';

import { createBoid, update } from './boids';
import { MAX_SPEED } from './constants';

export type UseBoidsProps = {
  count: number;
  width: number;
  height: number;
  maxSpeed?: number;
};

export const useBoids = ({
  count,
  width,
  height,
  maxSpeed = MAX_SPEED
}: UseBoidsProps) => {
  const boids = useMemo(() => {
    if (width === 0 || height === 0) return [];
    return Array.from({ length: count }, () =>
      createBoid(Math.random() * width, Math.random() * height)
    );
  }, [count, width, height]);

  useFrameCallback((frameInfo: FrameInfo) => {
    if (!width || !height) {
      return;
    }
    const delta = (frameInfo.timeSincePreviousFrame ?? 0) / 1000;
    update(boids, delta, maxSpeed, width, height);
  });

  return boids;
};
