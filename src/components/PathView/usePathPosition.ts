import { useEffect } from 'react';

import { SkPath, Skia } from '@shopify/react-native-skia';
import {
  SharedValue,
  useAnimatedReaction,
  useSharedValue
} from 'react-native-reanimated';

import { ContourMeasure } from './types';

export const usePathPosition = (path: SkPath, t: SharedValue<number>) => {
  const matrix = useSharedValue(Skia.Matrix());

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
      const [pos, tan] = contour?.getPosTan(length) ?? [
        { x: 0, y: 0 },
        { x: 0, y: 0 }
      ];

      matrix.modify((m) => {
        m.identity();
        m.translate(pos.x, pos.y);

        // todo - make these props. very much tied to the current use case
        m.scale(1.5, 1.5);
        m.rotate(Math.atan2(tan.y, tan.x) - Math.PI / 2);
        return m;
      });
    }
  );

  return matrix;
};
