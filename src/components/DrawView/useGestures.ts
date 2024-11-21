/* eslint-disable react-compiler/react-compiler */
import { useEffect, useMemo, useState } from 'react';

import { SkPoint, Skia } from '@shopify/react-native-skia';
import { Gesture } from 'react-native-gesture-handler';
import { makeMutable, runOnJS, useSharedValue } from 'react-native-reanimated';

import { createLogger } from '@helpers/log';
import { useStore } from '@model/useStore';
import type { Position, WorldTouchEventCallback } from '@types';
import { PathState } from './types';

const log = createLogger('useGestures');

const PATH_MAX = 5;
let pathCount = 0;

const createPathState = (idx: number) => {
  return {
    id: `path-${idx}`,
    isInUse: makeMutable(false),
    length: 0,
    path: makeMutable(Skia.Path.Make()),
    headPos: makeMutable(Skia.Point(0, 0)),
    headTan: makeMutable(Skia.Point(0, 0))
  };
};

export const useGestures = () => {
  // const pathCount = useSharedValue(0);
  const pathInUseIndex = useSharedValue(0);

  // const paths = useSharedValue<PathState[]>([]);
  const [paths, setPaths] = useState<PathState[]>([]);
  const [isPathsInited, setIsPathsInited] = useState(false);

  useEffect(() => {
    const states = Array(PATH_MAX)
      .fill(0)
      .map((_, idx) => createPathState(idx));

    setPaths(states);
    // setIsPathsInited(true);
  }, []);

  const pan = Gesture.Pan()
    .onStart((g) => {
      pathInUseIndex.value = (pathInUseIndex.value + 1) % PATH_MAX;

      const state = paths[pathInUseIndex.value];

      const path = state.path.value;
      path.reset();
      path.moveTo(g.x, g.y);
      state.path.value = path;

      state.headPos.value = Skia.Point(g.x, g.y);
      state.headTan.value = Skia.Point(0, 0);
      state.isInUse.value = true;
    })
    .onUpdate((g) => {
      const state = paths[pathInUseIndex.value];

      const path = state.path.value;
      path.lineTo(g.x, g.y);

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
    })
    .onEnd(() => {
      const state = paths[pathInUseIndex.value];
      state.isInUse.value = false;
    })
    .minDistance(1);

  const gesture = Gesture.Simultaneous(pan);

  return { gesture, paths, isPathsInited };
};
