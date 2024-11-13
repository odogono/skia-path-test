import { useCallback, useEffect } from 'react';

import { SkContourMeasure, SkPath, Skia } from '@shopify/react-native-skia';
import {
  SharedValue,
  useAnimatedReaction,
  useSharedValue
} from 'react-native-reanimated';

import { Position } from '@types';

export type ContourMeasure = [SkContourMeasure | null, number];

export const usePathContourMeasure = (path: SkPath, t: SharedValue<number>) => {
  const position = useSharedValue<Position>([0, 0]);
  const contourMeasure = useSharedValue<ContourMeasure>([null, 0]);

  useEffect(() => {
    const it = Skia.ContourMeasureIter(path, false, 1);
    const contour = it.next();
    const totalLength = contour?.length() ?? 0;
    contourMeasure.value = [contour, totalLength] as ContourMeasure;
  }, [path]);

  useAnimatedReaction(
    () => t.value,
    (t) => {
      const [contour, totalLength] = contourMeasure.value;
      const length = t * totalLength;
      const [pos] = contour?.getPosTan(length) ?? [{ x: 0, y: 0 }];

      position.value = [pos.x, pos.y];
    }
  );

  const getPosAtT = useCallback(
    (t: number) => {
      const [contour, totalLength] = contourMeasure.value;
      const length = t * totalLength;
      const [pos] = contour?.getPosTan(length) ?? [{ x: 0, y: 0 }];
      return [pos.x, pos.y];
    },
    [contourMeasure]
  );

  return { position, getPosAtT, contourMeasure };
};
