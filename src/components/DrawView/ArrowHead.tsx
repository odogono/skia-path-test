import { useMemo } from 'react';

import {
  Color,
  Group,
  Path,
  SharedValueType,
  SkPoint,
  Skia
} from '@shopify/react-native-skia';
import { useAnimatedReaction, useSharedValue } from 'react-native-reanimated';

import { Mutable } from '@types';

export const ArrowHead = ({
  position,
  tangent,
  color = 'lightblue'
}: {
  position: Mutable<SkPoint>;
  tangent: Mutable<SkPoint>;
  color: Color | SharedValueType<Color | undefined>;
}) => {
  const headMatrix = useSharedValue(Skia.Matrix());

  const path = useMemo(() => {
    const p = Skia.Path.Make();
    p.moveTo(-5, -5);
    p.lineTo(0, 5);
    p.lineTo(5, -5);
    p.close();
    return p;
  }, []);

  useAnimatedReaction(
    () => [position.value, tangent.value],
    ([position, tangent]) => {
      headMatrix.modify((m) => {
        m.identity();
        m.translate(position.x, position.y);
        m.scale(1.5, 1.5);
        m.rotate(Math.atan2(tangent.y, tangent.x) - Math.PI / 2);
        return m;
      });
    }
  );

  return (
    <Group matrix={headMatrix}>
      <Path path={path} color={color} style='fill' />
    </Group>
  );
};
