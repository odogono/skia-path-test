import { Circle } from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';

import { Boid } from './boids';

export const BoidSprite = ({ boid }: { boid: Boid }) => {
  const cx = useDerivedValue(() => boid.position.value[0]);
  const cy = useDerivedValue(() => boid.position.value[1]);

  return <Circle cx={cx} cy={cy} r={4} color='white' />;
};
