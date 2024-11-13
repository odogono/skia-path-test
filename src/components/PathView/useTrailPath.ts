import { SkPath } from '@shopify/react-native-skia';
import {
  SharedValue,
  useAnimatedReaction,
  useSharedValue
} from 'react-native-reanimated';

import { Position } from '@types';
import { type ContourMeasure } from './usePathContourMeasure';

export type TrailPathProps = {
  path: SkPath;
  t: SharedValue<number>;
  contourMeasure: SharedValue<ContourMeasure>;
};

export const useTrailPath = ({ path, t, contourMeasure }: TrailPathProps) => {
  const start = useSharedValue<Position>([0, 0]);
  const end = useSharedValue<Position>([0, 0]);

  useAnimatedReaction(
    () => t.value,
    (t) => {
      const trailLength = 0.25;
      const [contour, totalLength] = contourMeasure.value;

      const startT = (((t - trailLength) % 1) + 1) % 1;
      const endT = ((t % 1) + 1) % 1;
      const [startPos] = contour?.getPosTan(startT * totalLength) ?? [
        { x: 0, y: 0 }
      ];

      start.value = [startPos.x, startPos.y];

      const [endPos] = contour?.getPosTan(endT * totalLength) ?? [
        { x: 0, y: 0 }
      ];
      end.value = [endPos.x, endPos.y];
    }
  );

  return { start, end };
};
