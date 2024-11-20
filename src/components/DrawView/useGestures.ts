/* eslint-disable react-compiler/react-compiler */
import { useMemo, useState } from 'react';

import { Gesture } from 'react-native-gesture-handler';
import { runOnJS, useSharedValue } from 'react-native-reanimated';

import { createLogger } from '@helpers/log';
import { useStore } from '@model/useStore';
import type { Position, WorldTouchEventCallback } from '@types';

interface IPath {
  segments: String[];
  color?: string;
}

type PPath = {
  isClosed: boolean;
  id: string;
  length: number;
  points: Position[];
};

const log = createLogger('useGestures');

let pathCount = 0;

export const useGestures = () => {
  const [paths, setPaths] = useState<IPath[]>([]);

  const path = useSharedValue<PPath>({
    isClosed: false,
    id: `path-${pathCount++}`,
    length: 0,
    points: []
  });

  const pan = Gesture.Pan()
    .onStart((g) => {
      // const newPaths = [...paths];
      // newPaths[paths.length] = {
      //   segments: [],
      //   color: '#06d6a0'
      // };
      // newPaths[paths.length].segments.push(`M ${g.x} ${g.y}`);
      // runOnJS(setPaths)(newPaths);

      path.value = {
        id: `path-${pathCount++}`,
        isClosed: false,
        length: 1,
        points: [[g.x, g.y]]
      };

      runOnJS(log.debug)('onStart', g.x, g.y);
    })
    .onUpdate((g) => {
      // const index = paths.length - 1;
      // const newPaths = [...paths];
      // if (newPaths?.[index]?.segments) {
      //   newPaths[index].segments.push(`L ${g.x} ${g.y}`);

      //   // runOnJS(setPaths)(newPaths);
      // }
      const { length, points, id } = path.value;

      points.push([g.x, g.y]);
      path.value = { id, length: length + 1, points, isClosed: true };
    })
    .onEnd(() => {
      runOnJS(log.debug)('onEnd');
      // path.value = { ...path.value, isClosed: true };
    })
    .minDistance(1);

  const gesture = Gesture.Simultaneous(pan);

  return { gesture, paths, path };
};
