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

import { debugMsg2, debugMsg } from '@helpers/global';

const { createLogger } = require('@helpers/log');

const log = createLogger('TrailPath');

export type TrailPathProps = SkiaDefaultProps<PathProps, 'start' | 'end'> & {
  t: SharedValue<number>;
  trailLength: number;

  // how fast the trail fades away
  trailDecay?: number;

  // whether the trail follows the t point or is offset
  isFollow?: boolean;

  // whether the trail can wrap around the path
  isWrapped?: boolean;
};

export const TrailPath = ({
  t,
  trailLength,
  trailDecay = 0.2,
  isFollow = false,
  isWrapped = false,
  ...pathProps
}: TrailPathProps) => {
  const preStartT = useSharedValue(0);
  const preEndT = useSharedValue(0);
  const isPreVisible = useSharedValue(false);

  const tailT = useSharedValue(t.value);

  const postStartT = useSharedValue(0);
  const postEndT = useSharedValue(0);

  useFrameCallback((frameInfo) => {
    const headValue = t.value;
    let tailValue = tailT.value;
    const diff = tailValue - headValue;

    if (isFollow) {
      const delta = (frameInfo.timeSincePreviousFrame ?? 0) / 1000;
      const inc = trailDecay * delta;

      let isSame = false;
      // if the trail is close to the target, just set it to the target
      if (Math.abs(diff) < 0.001) {
        tailValue = headValue;
        isSame = true;
      } else if (tailValue < headValue) {
        tailValue += inc;
      } else if (tailValue > headValue) {
        tailValue -= inc;
      }

      // debugMsg.value = `t: ${headValue.toFixed(3)} ${isSame ? 'same' : ''}`;
      // debugMsg2.value = `tailT: ${tailValue.toFixed(3)} diff ${diff.toFixed(3)}`;
    }

    tailT.value = tailValue;

    let wrappedHeadT = ((headValue % 1) + 1) % 1;
    let wrappedTailT = ((tailValue % 1) + 1) % 1;

    preStartT.value = 0;
    preEndT.value = 0;

    if (
      isWrapped &&
      headValue <= 0 &&
      wrappedHeadT > 0 &&
      wrappedTailT < 1 &&
      tailValue > 0
    ) {
      // && Math.abs(diff) <= 0.5) {
      preStartT.value = wrappedHeadT;
      preEndT.value = 1;
      postStartT.value = 0;
      postEndT.value = wrappedTailT;

      debugMsg.value = `A preStartT: ${wrappedHeadT.toFixed(3)}`;
      debugMsg2.value = `ApostEndT: ${wrappedTailT.toFixed(3)} diff ${diff.toFixed(3)} wrap!`;
    } else if (
      isWrapped &&
      headValue >= 0 &&
      wrappedTailT > 0 &&
      wrappedHeadT < 1 &&
      tailValue < 0
    ) {
      preStartT.value = wrappedTailT;
      preEndT.value = 1;
      postStartT.value = 0;
      postEndT.value = wrappedHeadT;

      debugMsg.value = `B preStartT: ${wrappedTailT.toFixed(3)}`;
      debugMsg2.value = `B postEndT: ${wrappedHeadT.toFixed(3)} diff ${diff.toFixed(3)} wrap!`;
    }
    // change the trail path start and end depending on
    // the relative position head and tail
    else if (wrappedTailT < wrappedHeadT) {
      postStartT.value = wrappedTailT;
      postEndT.value = wrappedHeadT;

      debugMsg.value = `C preStartT: ${wrappedTailT.toFixed(3)}`;
      debugMsg2.value = `C postEndT: ${wrappedHeadT.toFixed(3)}`;
    } else {
      if (wrappedHeadT === 0 && headValue > 0) {
        postStartT.value = wrappedTailT === 0 ? 1 : wrappedTailT;
        postEndT.value = 1;
      } else {
        postStartT.value = wrappedHeadT;
        postEndT.value = wrappedTailT;
      }

      debugMsg.value = `D preStartT: ${wrappedHeadT.toFixed(3)} ${postStartT.value.toFixed(3)}`;
      debugMsg2.value = `D postEndT: ${wrappedTailT.toFixed(3)} ${postEndT.value.toFixed(3)}`;
    }

    // if (
    //   (preStartT.value === 0 && preEndT.value === 1) ||
    //   (postStartT.value === 0 && postEndT.value === 1)
    // ) {
    //   debugMsg.value = `preStartT: ${wrappedHeadT.toFixed(3)}`;
    //   debugMsg2.value = `postEndT: ${wrappedTailT.toFixed(3)} diff ${diff.toFixed(3)} wrap!`;
    // }
  });

  const blur = 20;

  return (
    <>
      {isWrapped && (
        <Path {...pathProps} start={preStartT} end={preEndT}>
          <BlurMask blur={blur} style='solid' />
        </Path>
      )}
      <Path {...pathProps} start={postStartT} end={postEndT}>
        <BlurMask blur={blur} style='solid' />
      </Path>
    </>
  );
};
