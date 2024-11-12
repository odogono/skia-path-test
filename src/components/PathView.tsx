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

import { centerSVGPath } from '@helpers/skia';
import { useStoreState } from '@model/useStore';
import { Position } from '@types';

const { createLogger } = require('@helpers/log');

const log = createLogger('PathView');

export type PathViewProps = {
  t?: SharedValue<number>;
};

export const PathView = ({ t: tProp }: PathViewProps) => {
  const t = useSharedValue(0);

  const [mViewMatrix, mViewBBox] = useStoreState((state) => [
    state.mViewMatrix,
    state.mViewBBox
  ]);

  const rawString =
    'M 128 0 L 168 80 L 256 93 L 192 155 L 207 244 L 128 202 L 49 244 L 64 155 L 0 93 L 88 80 L 128 0 Z';

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

  const { position, getPosAtT, contourMeasure } = usePathContourMeasure(
    path,
    t
  );
  const { start: trailStart, end: trailEnd } = useTrailPath(
    path,
    t,
    contourMeasure
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
      />
      <Circle cx={cx} cy={cy} r={5} color='white' />
    </Group>
  );
};

type TrailPathProps = SkiaDefaultProps<PathProps, 'start' | 'end'> & {
  t: SharedValue<number>;
  trailLength: number;
};

const TrailPath = ({ t, trailLength, ...pathProps }: TrailPathProps) => {
  const preStartT = useSharedValue(0);

  const postStartT = useSharedValue(0);
  const postEndT = useSharedValue(0);

  useAnimatedReaction(
    () => t.value,
    (t) => {
      const startT = t - trailLength;

      if (startT < 0) {
        preStartT.value = ((startT % 1) + 1) % 1;
      } else {
        preStartT.value = 1;
      }

      postStartT.value = Math.max(startT, 0);
      postEndT.value = t;
    }
  );
  const blur = 20;

  return (
    <>
      <Path {...pathProps} start={preStartT} end={1}>
        <BlurMask blur={blur} style='solid' />
      </Path>
      <Path {...pathProps} start={postStartT} end={postEndT}>
        <BlurMask blur={blur} style='solid' />
      </Path>
    </>
  );
};

type ContourMeasure = [SkContourMeasure | null, number];

const useTrailPath = (
  path: SkPath,
  t: SharedValue<number>,
  contourMeasure: SharedValue<ContourMeasure>
) => {
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

const usePathContourMeasure = (path: SkPath, t: SharedValue<number>) => {
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
