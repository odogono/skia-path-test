import { useCallback, useEffect, useMemo } from 'react';

import {
  Circle,
  Group,
  Path,
  Rect,
  SkContourMeasure,
  SkPath,
  Skia
} from '@shopify/react-native-skia';
import {
  Easing,
  SharedValue,
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming
} from 'react-native-reanimated';

import { useStoreState } from '@model/useStore';
import { Position } from '@types';

const { createLogger } = require('@helpers/log');

const log = createLogger('PathView');

export type PathViewProps = {
  t: SharedValue<number>;
};

export const PathView = ({ t: tProp }: PathViewProps) => {
  const t = useSharedValue(0);

  const [mViewMatrix, mViewBBox] = useStoreState((state) => [
    state.mViewMatrix,
    state.mViewBBox
  ]);

  const rawString =
    'M 128 0 L 168 80 L 256 93 L 192 155 L 207 244 L 128 202 L 49 244 L 64 155 L 0 93 L 88 80 L 128 0 Z';
  // const rawString = 'M-100 -100L100 -100L100 100L-100 100L-100 -100Z';

  // creates a square path
  const path = useMemo(() => Skia.Path.MakeFromSVGString(rawString)!, []);

  const currentPoint = usePathContourMeasure(path, t);

  useEffect(() => {
    t.value = withRepeat(
      withTiming(1, {
        duration: 5000,
        easing: Easing.linear
      }),
      -1,
      false
    );

    // log.debug('pathGeometry', points);
  }, []);

  const cx = useDerivedValue(() => currentPoint.value[0]);
  const cy = useDerivedValue(() => currentPoint.value[1]);

  return (
    <Group matrix={mViewMatrix}>
      <Path path={path} color='lightblue' style='stroke' strokeWidth={5} />
      <Circle cx={cx} cy={cy} r={5} color='black' />
    </Group>
  );
};

const usePathContourMeasure = (path: SkPath, t: SharedValue<number>) => {
  const position = useSharedValue<Position>([0, 0]);
  const measureIter = useSharedValue<[SkContourMeasure | null, number]>([
    null,
    0
  ]);

  useEffect(() => {
    const it = Skia.ContourMeasureIter(path, false, 1);
    const contour = it.next();
    const totalLength = contour?.length() ?? 0;
    measureIter.value = [contour, totalLength] as [
      SkContourMeasure | null,
      number
    ];
  }, [path]);

  useAnimatedReaction(
    () => t.value,
    (t) => {
      const [contour, totalLength] = measureIter.value;
      const length = t * totalLength;
      const [pos] = contour?.getPosTan(length) ?? [{ x: 0, y: 0 }];

      position.value = [pos.x, pos.y];
    }
  );

  return position;
};
