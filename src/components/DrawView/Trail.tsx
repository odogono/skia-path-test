import { useState } from 'react';

import { PathProps, SkiaDefaultProps } from '@shopify/react-native-skia';
import {
  Easing,
  runOnJS,
  useAnimatedReaction,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';

import { TrailPath } from '@components/PathView/TrailPath';
import { createLogger } from '@helpers/log';
import { ArrowHead } from './ArrowHead';
import { PathState } from './types';

const log = createLogger('DrawTrail');

type DrawTrailProps = SkiaDefaultProps<PathProps, 'start' | 'end'> & PathState;

export const Trail = ({
  path,
  headPos,
  headTan,
  id,
  isInUse
}: DrawTrailProps) => {
  const head = useSharedValue(0);
  const tail = useSharedValue(0);
  const [showArrowHead, setShowArrowHead] = useState(true);

  // called when the path changes its isInUse value
  useAnimatedReaction(
    () => isInUse.value,
    (isInUse) => {
      runOnJS(log.debug)('>isInUse DrawTrail', id, isInUse);

      if (isInUse) {
        // this trail has become active - so reset the various animated values
        head.value = 0;
        tail.value = 0;
        head.value = withTiming(1, { duration: 100, easing: Easing.linear });
        runOnJS(setShowArrowHead)(true);
      }
    }
  );

  useAnimatedReaction(
    () => tail.value,
    (tailValue) => {
      if (tailValue > 0.99) {
        runOnJS(setShowArrowHead)(false);
      }
    }
  );

  log.debug('DrawTrail', id, isInUse);

  if (!isInUse) {
    return null;
  }

  return (
    <>
      <TrailPath
        path={path}
        color='white'
        style='stroke'
        strokeWidth={5}
        head={head}
        tail={tail}
        trailLength={0.9}
        isFollow={true}
        trailDecay={0.5}
        isWrapped={false}
        trailDivisions={12}
        // tailColor='black'
        tailColor='#161e27'
      />
      {showArrowHead && <ArrowHead position={headPos} tangent={headTan} />}
    </>
  );
};
