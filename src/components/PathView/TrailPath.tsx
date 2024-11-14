import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  BlurMask,
  Circle,
  Color,
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
  cancelAnimation,
  makeMutable,
  runOnJS,
  useAnimatedReaction,
  useDerivedValue,
  useFrameCallback,
  useSharedValue,
  withRepeat,
  withTiming
} from 'react-native-reanimated';

import { getAngularDiff } from '@helpers/getAngularDiff';
import { debugMsg2, debugMsg } from '@helpers/global';
import { Mutable } from '@types';
import { updatePathSections } from './updatePathSections';
import { usePathSections } from './usePathSections';

const { createLogger } = require('@helpers/log');

const log = createLogger('TrailPath');

export type TrailPathProps = SkiaDefaultProps<PathProps, 'start' | 'end'> & {
  t: SharedValue<number>;
  trailLength: number;

  trailDivisions: number;

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
  trailDivisions = 1,
  isFollow = false,
  isWrapped = false,
  ...pathProps
}: TrailPathProps) => {
  const tailT = useSharedValue(t.value);

  const pathSections = usePathSections(trailDivisions + 2);

  // console.log('oh boy', Skia.Color('lightblue'));

  useFrameCallback((frameInfo) => {
    const headValue = t.value;
    let tailValue = tailT.value;

    const aDiff = getAngularDiff(tailValue, headValue);

    // const diff = tailValue - headValue;

    if (isFollow) {
      const delta = (frameInfo.timeSincePreviousFrame ?? 0) / 1000;
      const inc = trailDecay * delta;

      // let isSame = false;
      // if the trail is close to the target, just set it to the target
      if (Math.abs(aDiff) < 0.005) {
        tailValue = headValue;
        // isSame = true;
      } else {
        tailValue += Math.sign(aDiff) * inc;
      }

      tailT.value = ((tailValue % 1) + 1) % 1;

      // debugMsg.value = `t: ${headValue.toFixed(3)}`;
      // debugMsg2.value = `tailT: ${tailValue.toFixed(3)} diff ${aDiff.toFixed(3)} inc ${(Math.sign(aDiff) * inc).toFixed(3)}`;
    }

    if (pathSections) {
      //&& headValue !== tailValue) {
      updatePathSections(
        pathSections,
        tailValue,
        headValue,
        trailDivisions,
        isWrapped
      );
    }
  });

  const blur = 20;
  const len = pathSections?.sections.length;

  return (
    <>
      {pathSections?.sections.map((section, index) => (
        <Path
          {...pathProps}
          key={index}
          start={section.start}
          end={section.end}
          color={section.color}
          strokeCap={index === 0 || index === len ? 'round' : 'butt'}
        >
          {/* <BlurMask blur={blur} style='solid' /> */}
        </Path>
      ))}
    </>
  );
};
