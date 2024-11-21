import { useCallback, useEffect, useState } from 'react';

import { SkPath, SkPoint, Skia } from '@shopify/react-native-skia';
import {
  cancelAnimation,
  makeMutable,
  runOnJS,
  useSharedValue
} from 'react-native-reanimated';

import { setAnimatedTimeout } from '@helpers/animatedTimeout';
import { createLogger } from '@helpers/log';
import { simplify } from '@helpers/simplify';
import { Mutable } from '@types';
import { PathState } from './types';

let pathCount = 0;

const createPathState = () => {
  return {
    id: `path-${pathCount++}`,
    isInUse: false,
    length: 0,
    path: Skia.Path.Make(),
    headPos: Skia.Point(0, 0),
    headTan: Skia.Point(0, 0)
  };
};

const destroyPathState = (state: PathState) => {
  const { length, path, headPos, headTan } = state;
  // cancelAnimation(isInUse);
  // cancelAnimation(length);
  // cancelAnimation(path);
  // cancelAnimation(headPos);
  // cancelAnimation(headTan);
};

// const gPathState = createPathState();

// const gPathStates = Array(15).fill(null).map(createPathState);

const log = createLogger('usePathStates');

export const usePathStates = (count: number = 15) => {
  const states = useSharedValue<PathState[]>([]);
  const statesMap = useSharedValue<Record<string, PathState>>({});
  const inc = useSharedValue(0);

  useEffect(() => {
    log.debug('creating states');
    const newStates: PathState[] = [];
    for (let ii = 0; ii < count; ii++) {
      newStates.push(createPathState());
    }

    log.debug('ok', newStates[0].isInUse);
    // states.value = newStates;

    states.set(() => newStates);
    // setStates(newStates);
    return () => {
      log.debug('destroying states');
      for (let ii = 0; ii < count; ii++) {
        // destroyPathState(states[ii]);
      }
      // setStates([]);
      states.set(() => []);
    };
  }, []);

  const applyPath = useCallback((id: string, points: SkPoint[]) => {
    'worklet';

    let state = statesMap.value[id];
    if (!state) {
      // find first available state
      const unused = states.value.find((s) => !s.isInUse);

      state = unused ?? states.value[0];

      statesMap.value[id] = state;

      setAnimatedTimeout(() => {
        state.isInUse = false;
        runOnJS(log.debug)('state released', id);
        inc.value++;
      }, 3000);
    }

    if (!state) {
      runOnJS(log.debug)('state not found', id);
      return;
    }

    // convert the points to a skia path
    const skPath = Skia.Path.Make();
    skPath.moveTo(points[0].x, points[0].y);
    for (let ii = 1; ii < points.length; ii++) {
      skPath.lineTo(points[ii].x, points[ii].y);
    }

    // get the total length of the path and the position and tangent at the end
    const it = Skia.ContourMeasureIter(skPath, false, 1);
    const contour = it.next();
    const totalLength = contour?.length() ?? 0;
    const [pos, tan] = contour?.getPosTan(totalLength) ?? [
      { x: 0, y: 0 },
      { x: 0, y: 0 }
    ];

    state.path = skPath;
    state.headPos = pos;
    state.headTan = tan;
    state.length = totalLength;
    state.isInUse = true;
    inc.value++;
  }, []);

  return { applyPath, inc, states };
};
