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
  runOnJS,
  useAnimatedReaction,
  useDerivedValue,
  useFrameCallback,
  useSharedValue,
  withRepeat,
  withTiming
} from 'react-native-reanimated';

import { debugMsg } from '@helpers/global';

const { createLogger } = require('@helpers/log');

const log = createLogger('TrailPath');

export type TrailPathProps = SkiaDefaultProps<PathProps, 'start' | 'end'> & {
  t: SharedValue<number>;
  trailLength: number;

  // how fast the trail fades away
  trailDecay?: number;

  // whether the trail follows the t point or is offset
  isFollow?: boolean;
};

export const TrailPath = ({
  t,
  trailLength,
  trailDecay = 0.2,
  isFollow = false,
  ...pathProps
}: TrailPathProps) => {
  const preStartT = useSharedValue(0);

  const tailT = useSharedValue(t.value);

  const postStartT = useSharedValue(0);
  const postEndT = useSharedValue(0);

  useFrameCallback((frameInfo) => {
    if (isFollow) {
      const delta = (frameInfo.timeSincePreviousFrame ?? 0) / 1000;
      const inc = trailDecay * delta;
      const diff = tailT.value - t.value;

      // if the trail is close to the target, just set it to the target
      if (Math.abs(diff) < 0.01) {
        tailT.value = t.value;
      } else if (tailT.value < t.value) {
        tailT.value += inc;
      } else if (tailT.value > t.value) {
        tailT.value -= inc;
      }

      debugMsg.value = `diff: ${diff.toFixed(3)}`;
    }
    // change the trail path start and end depending on
    // the relative position head and tail
    if (tailT.value < t.value) {
      postStartT.value = tailT.value;
      postEndT.value = t.value;
    } else if (tailT.value > t.value) {
      postStartT.value = t.value;
      postEndT.value = tailT.value;
    } else {
      postStartT.value = t.value;
      postEndT.value = t.value;
    }
  });

  const blur = 20;

  useEffect(() => {
    debugMsg.value = `t - ${t.value}`;
    log.debug('debugMsg value', debugMsg.value);
  }, [t.value]);

  return (
    <>
      {/* <Path {...pathProps} start={preStartT} end={1}>
        <BlurMask blur={blur} style='solid' />
      </Path> */}
      <Path {...pathProps} start={postStartT} end={postEndT}>
        <BlurMask blur={blur} style='solid' />
      </Path>
    </>
  );
};
