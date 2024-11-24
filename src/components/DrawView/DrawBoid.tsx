import { SkPoint, Skia } from '@shopify/react-native-skia';
import { useAnimatedReaction, useSharedValue } from 'react-native-reanimated';

import { setAnimatedTimeout } from '@helpers/animatedTimeout';
import type { Mutable, Position } from '@types';

export type DrawBoidProps = {
  id: number;
  position: Mutable<Position>;

  startPath: (point: SkPoint) => number;
  updatePath: (stateIndex: number, point: SkPoint) => number;
  endPath: (stateIndex: number) => void;
};

export const DrawBoid = ({
  id,
  position,
  startPath,
  updatePath,
  endPath
}: DrawBoidProps) => {
  const pathIndex = useSharedValue(-2);

  useAnimatedReaction(
    () => position.value,
    (positionValue) => {
      if (pathIndex.value === -2) {
        // initiate a new path for the boid
        pathIndex.value = -1;

        const timeout = Math.floor(Math.random() * (5000 - 1000) + 1000);

        // wait for a random time before starting the path
        setAnimatedTimeout(() => {
          pathIndex.value = startPath(
            Skia.Point(positionValue[0], positionValue[1])
          );

          const timeout = Math.floor(Math.random() * (6000 - 4000) + 4000);

          // wait for a random time before ending the path
          setAnimatedTimeout(() => {
            endPath(pathIndex.value);
            pathIndex.value = -2;
          }, timeout);
        }, timeout);
      } else if (pathIndex.value === -1) {
        // do nothing - wait for the startPath to begin
      } else {
        // update the path with the current position
        updatePath(
          pathIndex.value,
          Skia.Point(positionValue[0], positionValue[1])
        );
      }
    }
  );

  return null;
};
