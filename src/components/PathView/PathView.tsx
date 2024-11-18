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
import { centerSVGPath, fitSVGPathToBounds } from '@helpers/skia';
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

// const rawString =
//   'm135.72 44.03c66.496 49.921 138.02 151.14 164.28 205.46 26.262-54.316 97.782-155.54 164.28-205.46 47.98-36.021 125.72-63.892 125.72 24.795 0 17.712-10.155 148.79-16.111 170.07-20.703 73.984-96.144 92.854-163.25 81.433 117.3 19.964 147.14 86.092 82.697 152.22-122.39 125.59-175.91-31.511-189.63-71.766-2.514-7.3797-3.6904-10.832-3.7077-7.8964-.0174-2.9357-1.1937.5167-3.7077 7.8964-13.714 40.255-67.233 197.36-189.63 71.766-64.444-66.128-34.605-132.26 82.697-152.22-67.108 11.421-142.55-7.4491-163.25-81.433-5.9562-21.282-16.111-152.36-16.111-170.07 0-88.687 77.742-60.816 125.72-24.795z';

export const PathView = ({ t: tProp }: PathViewProps) => {
  const t = tProp ?? useSharedValue(0);

  const [mViewMatrix, mViewBBox] = useStoreState((state) => [
    state.mViewMatrix,
    state.mViewBBox
  ]);

  // Center the path around 0,0
  const centeredPathString = useMemo(
    // () => centerSVGPath(rawString),
    () =>
      fitSVGPathToBounds(rawString, {
        x: -150,
        y: -150,
        width: 300,
        height: 300
      }),
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

  // useEffect(() => {
  //   t.value = withRepeat(
  //     withTiming(1, {
  //       duration: 5000,
  //       easing: Easing.linear
  //     }),
  //     -1,
  //     false
  //   );
  // }, []);

  const cx = useDerivedValue(() => position.value[0]);
  const cy = useDerivedValue(() => position.value[1]);

  return (
    <Group matrix={mViewMatrix}>
      <Path
        path={path}
        color='#FFFFFF11'
        style='stroke'
        strokeWidth={5}
        strokeCap='round'
        strokeJoin='round'
      />
      <TrailPath
        path={path}
        color='blue'
        style='stroke'
        strokeWidth={10}
        strokeCap='round'
        strokeJoin='round'
        t={t}
        trailLength={0.3}
        isFollow={false}
        trailDecay={0.05}
        isWrapped={false}
        trailDivisions={10}
        tailColor='red'
      />
      <Circle cx={cx} cy={cy} r={5} color='white' />
    </Group>
  );
};
