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
import { useFocusEffect } from 'expo-router';
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
  head?: SharedValue<number>;
};

const rainbowColors: string[] = [
  '#FF0000',
  '#FF7F00',
  '#FFFF00',
  '#00FF00',
  '#0000FF',
  '#4B0082',
  '#9400D3'
];

// const rawString =
// 'M 128 0 L 168 80 L 256 93 L 192 155 L 207 244 L 128 202 L 49 244 L 64 155 L 0 93 L 88 80 L 128 0 Z';

const rawString =
  'm135.72 44.03c66.496 49.921 138.02 151.14 164.28 205.46 26.262-54.316 97.782-155.54 164.28-205.46 47.98-36.021 125.72-63.892 125.72 24.795 0 17.712-10.155 148.79-16.111 170.07-20.703 73.984-96.144 92.854-163.25 81.433 117.3 19.964 147.14 86.092 82.697 152.22-122.39 125.59-175.91-31.511-189.63-71.766-2.514-7.3797-3.6904-10.832-3.7077-7.8964-.0174-2.9357-1.1937.5167-3.7077 7.8964-13.714 40.255-67.233 197.36-189.63 71.766-64.444-66.128-34.605-132.26 82.697-152.22-67.108 11.421-142.55-7.4491-163.25-81.433-5.9562-21.282-16.111-152.36-16.111-170.07 0-88.687 77.742-60.816 125.72-24.795z';

export const PathView = ({ head: headProp }: PathViewProps) => {
  const head = headProp ?? useSharedValue(0);

  useFocusEffect(
    useCallback(() => {
      log.debug('PathView gained focus');
      // Do something when screen focuses

      return () => {
        log.debug('PathView lost focus');
        // Clean up when screen loses focus
      };
    }, [])
  );

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

  const wrappedHead = useDerivedValue(() => ((head.value % 1) + 1) % 1);

  // useAnimatedReaction(
  //   () => wrappedT.value,
  //   (wrappedT) => {
  //     debugMsg.value = `wrappedT: ${wrappedT.toFixed(3)}`;
  //   }
  // );

  const { position, tangent } = usePathContourMeasure(path, wrappedHead);

  const arrowHead = useMemo(() => {
    const arrowHead = Skia.Path.Make();
    arrowHead.moveTo(-5, -5);
    arrowHead.lineTo(0, 5);
    arrowHead.lineTo(5, -5);
    arrowHead.close();
    return arrowHead;
  }, []);

  useEffect(() => {
    head.value = withRepeat(
      withTiming(1, {
        duration: 6000,
        easing: Easing.linear
      }),
      -1,
      false
    );
  }, []);

  const headMatrix = useSharedValue(Skia.Matrix());

  useAnimatedReaction(
    () => [position.value, tangent.value],
    ([position, tangent]) => {
      headMatrix.modify((m) => {
        m.identity();
        m.translate(position[0], position[1]);
        m.scale(1.5, 1.5);
        m.rotate(Math.atan2(tangent[1], tangent[0]) - Math.PI / 2);
        return m;
      });
    }
  );

  return (
    <Group matrix={mViewMatrix}>
      {/* <Path
        path={path}
        color='#FFFFFF11'
        style='stroke'
        strokeWidth={5}
        strokeCap='round'
        strokeJoin='round'
      /> */}
      <TrailPath
        path={path}
        color='white'
        style='stroke'
        strokeWidth={5}
        head={head}
        trailLength={0.4}
        isFollow={true}
        trailDecay={0.0}
        isWrapped={true}
        trailDivisions={15}
        tailColor='#161e27'
      />
      <Group matrix={headMatrix}>
        <Path path={arrowHead} color='white' style='fill' />
      </Group>
      {/* <Circle cx={cx} cy={cy} r={5} color='white' /> */}
    </Group>
  );
};
