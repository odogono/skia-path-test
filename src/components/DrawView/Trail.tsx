import { useState } from 'react';

import {
  Easing,
  runOnJS,
  useAnimatedReaction,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';

import { TrailPath, TrailPathProps } from '@components/PathView/TrailPath';
import { createLogger } from '@helpers/log';
import { ArrowHead } from './ArrowHead';
import { PathState } from './types';

const log = createLogger('Trail');

type DrawTrailProps = TrailPathProps & PathState;

export const Trail = ({
  path,
  headPos,
  headTan,
  isInUse,
  ...trailPathProps
}: DrawTrailProps) => {
  const head = useSharedValue(0);
  const tail = useSharedValue(0);
  const [showArrowHead, setShowArrowHead] = useState(true);
  const arrowColor = trailPathProps.color;

  // called when the path changes its isInUse value
  useAnimatedReaction(
    () => isInUse.value,
    (isInUse) => {
      // runOnJS(log.debug)('>isInUse DrawTrail', id);

      if (isInUse) {
        // this trail has become active - so reset the various animated values
        head.value = 0;
        tail.value = 0;
        head.value = withTiming(1, { duration: 200, easing: Easing.linear });
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

  if (!isInUse) {
    return null;
  }

  return (
    <>
      <TrailPath
        path={path}
        style='stroke'
        strokeWidth={5}
        tail={tail}
        isFollow
        trailDecay={0.3}
        isWrapped={false}
        tailColor='black'
        {...trailPathProps}
        head={head}
      />
      {showArrowHead && (
        <ArrowHead color={arrowColor} position={headPos} tangent={headTan} />
      )}
    </>
  );
};
