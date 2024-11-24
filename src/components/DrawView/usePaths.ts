/* eslint-disable react-compiler/react-compiler */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { SkPoint, Skia } from '@shopify/react-native-skia';
import { Gesture } from 'react-native-gesture-handler';
import {
  makeMutable,
  runOnJS,
  useDerivedValue,
  useSharedValue
} from 'react-native-reanimated';

import { rainbowColors } from '@constants/Colors';
import { createLogger } from '@helpers/log';

const log = createLogger('usePaths');

const createPathState = (idx: number) => {
  return {
    id: `path-${idx}`,
    isInUse: makeMutable(false),
    length: 0,
    path: makeMutable(Skia.Path.Make()),
    headPos: makeMutable(Skia.Point(0, 0)),
    headTan: makeMutable(Skia.Point(0, 0)),
    color: rainbowColors[idx % rainbowColors.length]
  };
};

export const usePaths = (count: number = 5) => {
  const pathInUseIndex = useSharedValue(0);

  const paths = useMemo(() => {
    return Array(count)
      .fill(0)
      .map((_, idx) => createPathState(idx));
  }, [count]);

  // bit-of-a-hack: the value of the useState paths is copied into
  // a shared value so that it can be used on the UI thread
  const pathsValue = useDerivedValue(() => {
    return paths;
  });

  const startPath = useCallback((point: SkPoint) => {
    'worklet';
    // pathInUseIndex.value = (pathInUseIndex.value + 1) % PATH_MAX;
    const idx = pathInUseIndex.value++ % count;

    const state = pathsValue.value[idx];

    const path = state.path.value;
    path.reset();
    path.moveTo(point.x, point.y);
    state.path.value = path;

    state.headPos.value = Skia.Point(point.x, point.y);
    state.headTan.value = Skia.Point(0, 0);
    state.isInUse.value = true;

    // runOnJS(log.debug)(`startPath: ${idx}`);
    return idx;
  }, []);

  const updatePath = useCallback((stateIndex: number, point: SkPoint) => {
    'worklet';

    const state = pathsValue.value[stateIndex];

    const path = state.path.value;
    path.lineTo(point.x, point.y);

    const it = Skia.ContourMeasureIter(path, false, 1);
    const contour = it.next();
    const totalLength = contour?.length() ?? 0;
    const [pos, tan] = contour?.getPosTan(totalLength) ?? [
      { x: 0, y: 0 },
      { x: 0, y: 0 }
    ];
    state.headPos.value = pos;
    state.headTan.value = tan;
    state.length = totalLength;

    return stateIndex;
  }, []);

  const endPath = useCallback((stateIndex: number) => {
    'worklet';

    const state = pathsValue.value[stateIndex];
    state.isInUse.value = false;
  }, []);

  return { paths, startPath, updatePath, endPath };
};
