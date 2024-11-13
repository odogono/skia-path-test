import { useCallback, useEffect, useMemo } from 'react';

import {
  BlurMask,
  Circle,
  CornerPathEffect,
  Group,
  Path,
  PathProps,
  Rect,
  SkContourMeasure,
  SkPath,
  SkPoint,
  Skia,
  SkiaDefaultProps
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

import { debugMsg } from '@helpers/global';
import { centerSVGPath } from '@helpers/skia';
import { useStoreState } from '@model/useStore';
import { TrailPath } from './TrailPath';
import { usePathContourMeasure } from './usePathContourMeasure';
import { useTrailPath } from './useTrailPath';

const { createLogger } = require('@helpers/log');

const log = createLogger('PathView');

export type PathViewProps = {
  t?: SharedValue<number>;
};

const rawString =
  'M 128 0 L 168 80 L 256 93 L 192 155 L 207 244 L 128 202 L 49 244 L 64 155 L 0 93 L 88 80 L 128 0 Z';

export const PathView = ({ t: tProp }: PathViewProps) => {
  const t = tProp ?? useSharedValue(0);

  const [mViewMatrix, mViewBBox] = useStoreState((state) => [
    state.mViewMatrix,
    state.mViewBBox
  ]);

  // Center the path around 0,0
  const centeredPathString = useMemo(
    () => centerSVGPath(rawString),
    [rawString]
  );

  // Use the centered path string
  const path = useMemo(
    () => Skia.Path.MakeFromSVGString(centeredPathString)!,
    [centeredPathString]
  );

  const wrappedT = useDerivedValue(() => ((t.value % 1) + 1) % 1);

  // useAnimatedReaction(
  //   () => wrappedT.value,
  //   (wrappedT) => {
  //     debugMsg.value = `wrappedT: ${wrappedT.toFixed(3)}`;
  //   }
  // );

  const { position, getPosAtT, contourMeasure } = usePathContourMeasure(
    path,
    wrappedT
  );

  useEffect(() => {
    t.value = withRepeat(
      withTiming(1, {
        duration: 5000,
        easing: Easing.linear
      }),
      -1,
      false
    );
  }, []);

  const cx = useDerivedValue(() => position.value[0]);
  const cy = useDerivedValue(() => position.value[1]);

  return (
    <Group matrix={mViewMatrix}>
      <Path
        path={path}
        color='#FFFFFF11'
        style='stroke'
        strokeWidth={10}
        strokeCap='round'
        strokeJoin='round'
      />
      <TrailPath
        path={path}
        color='lightblue'
        style='stroke'
        strokeWidth={10}
        strokeCap='round'
        strokeJoin='round'
        t={t}
        trailLength={0.1}
        isFollow={true}
        trailDecay={0.1}
        isWrapped={true}
      />
      <Circle cx={cx} cy={cy} r={5} color='white' />
    </Group>
  );
};
