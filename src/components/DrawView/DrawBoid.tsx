import { SkPoint, Skia } from '@shopify/react-native-skia';
import { useAnimatedReaction, useSharedValue } from 'react-native-reanimated';

import { setAnimatedTimeout } from '@helpers/animatedTimeout';
import { createLogger } from '@helpers/log';
import type { Mutable, Position } from '@types';

export type DrawBoidProps = {
  id: number;
  position: Mutable<Position>;

  startPath: (point: SkPoint) => number;
  updatePath: (stateIndex: number, point: SkPoint) => number;
  endPath: (stateIndex: number) => void;
};

const log = createLogger('DrawBoid');

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
        pathIndex.value = -1;

        const timeout = Math.floor(Math.random() * (5000 - 1000) + 1000);

        setAnimatedTimeout(() => {
          pathIndex.value = startPath(
            Skia.Point(positionValue[0], positionValue[1])
          );

          const timeout = Math.floor(Math.random() * (6000 - 4000) + 4000);

          setAnimatedTimeout(() => {
            endPath(pathIndex.value);
            // runOnJS(log.debug)('endPath', pathIndex.value);
            pathIndex.value = -2;
          }, timeout);
        }, timeout);
      } else if (pathIndex.value === -1) {
        // do nothing - wait for the startPath to begin
      } else {
        updatePath(
          pathIndex.value,
          Skia.Point(positionValue[0], positionValue[1])
        );
      }
    }
  );

  return null;
};
