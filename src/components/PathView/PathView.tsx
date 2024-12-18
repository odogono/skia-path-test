import { useCallback, useMemo, useState } from 'react';

import { Group, Path, Skia } from '@shopify/react-native-skia';
import { useFocusEffect } from 'expo-router';
import {
  Easing,
  SharedValue,
  cancelAnimation,
  runOnJS,
  runOnUI,
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming
} from 'react-native-reanimated';

import { blueskyPath, circlePath, linePath, starPath } from '@constants/svg';
import { fitSVGPathToBounds } from '@helpers/skia';
import { useStoreState } from '@model/useStore';
import { TrailPath } from './TrailPath';
import { usePathContourMeasure } from './usePathContourMeasure';
import { usePathPosition } from './usePathPosition';

const { createLogger } = require('@helpers/log');

const log = createLogger('PathView');

export type PathViewProps = {
  head?: SharedValue<number>;
};

const svgPath = blueskyPath;

export const PathView = ({ head: headProp }: PathViewProps) => {
  const headDefault = useSharedValue(0);
  const head = headProp ?? headDefault;
  const tail = useSharedValue(0);
  const wrappedHead = useDerivedValue(() => ((head.value % 1) + 1) % 1);
  const [mViewMatrix] = useStoreState((state) => [state.mViewMatrix]);
  const [isActive, setIsActive] = useState(true);

  const path = useMemo(() => {
    // Center the path around 0,0
    const centered = fitSVGPathToBounds(svgPath, {
      x: -150,
      y: -150,
      width: 300,
      height: 300
    });

    return Skia.Path.MakeFromSVGString(centered)!;
  }, [svgPath]);

  const headMatrix = usePathPosition(path, wrappedHead);

  const arrowHead = useMemo(() => {
    const arrowHead = Skia.Path.Make();
    arrowHead.moveTo(-5, -5);
    arrowHead.lineTo(0, 5);
    arrowHead.lineTo(5, -5);
    arrowHead.close();
    return arrowHead;
  }, []);

  useFocusEffect(
    useCallback(() => {
      runOnUI(() => {
        // setting it slightly negative to avoid the tail locking with the head
        // eslint-disable-next-line react-compiler/react-compiler
        head.value = 0.01;
        tail.value = 0;
        head.value = withRepeat(
          withTiming(1, {
            duration: 6000,
            easing: Easing.linear
          }),
          -1,
          false
        );
        runOnJS(setIsActive)(true);
      })();

      return () => {
        runOnUI(() => {
          if (head.value !== null) {
            cancelAnimation(head);
            // setting it slightly ahead to avoid the tail locking with the head
            head.value = 0.01;
            tail.value = 1;
          }
          runOnJS(setIsActive)(false);
        })();
      };
    }, [head])
  );

  if (!isActive) {
    return null;
  }

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
        color='lightblue'
        style='stroke'
        strokeWidth={5}
        head={head}
        tail={tail}
        trailLength={0.4}
        isFollow
        trailDecay={0}
        isWrapped
        trailDivisions={30}
        tailColor='transparent'
        hasGlow={false}
      />
      <Group matrix={headMatrix}>
        <Path path={arrowHead} color='lightblue' style='fill' />
      </Group>
    </Group>
  );
};
