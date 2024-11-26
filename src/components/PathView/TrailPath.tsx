import {
  BlurMask,
  Color,
  Path,
  PathProps,
  SharedValueType,
  SkiaDefaultProps
} from '@shopify/react-native-skia';
import {
  SharedValue,
  useFrameCallback,
  useSharedValue
} from 'react-native-reanimated';

import { getAngularDiff } from '@helpers/getAngularDiff';
import { updatePathSections } from './updatePathSections';
import { usePathSections } from './usePathSections';

const { createLogger } = require('@helpers/log');

const log = createLogger('TrailPath');

export type TrailPathProps = SkiaDefaultProps<PathProps, 'start' | 'end'> & {
  // position of the head
  head: SharedValue<number>;

  // position of the tail
  tail?: SharedValue<number>;

  // maximum distance the tail can be from the head
  trailLength: number;

  // the number of sections to divide the trail into
  trailDivisions: number;

  // how fast the trail fades away
  trailDecay?: number;

  // whether the trail follows the t point or is offset
  isFollow?: boolean;

  // whether the trail can wrap around the path
  isWrapped?: boolean;

  // color of the tail - only useful if trailDivisions > 1
  tailColor?: Color | SharedValueType<Color | undefined>;

  hasGlow?: boolean;
};

export const TrailPath = ({
  head,
  tail,
  trailLength,
  trailDecay = 0.2,
  trailDivisions = 1,
  isFollow = false,
  isWrapped = false,
  tailColor,
  hasGlow = true,
  ...pathProps
}: TrailPathProps) => {
  const defaultT = useSharedValue(0);

  const tailT = tail ?? defaultT;

  const pathSections = usePathSections({
    count: trailDivisions + 2,
    headColor: pathProps.color as Color,
    tailColor: tailColor as Color
  });

  useFrameCallback((frameInfo) => {
    const headValue = head.value;
    let tailValue = tailT.value;

    const aDiff = isWrapped
      ? getAngularDiff(tailValue, headValue)
      : headValue - tailValue;

    if (isFollow) {
      const delta = (frameInfo.timeSincePreviousFrame ?? 0) / 1000;
      const inc = trailDecay * delta;

      // let isSame = false;
      // if the trail is close to the target, just set it to the target
      if (Math.abs(aDiff) < 0.005) {
        tailValue = headValue;
        // debugMsg2.value = `tailValue: ${tailValue.toFixed(3)} =`;
      } else if (Math.abs(aDiff) > trailLength) {
        tailValue = headValue - Math.sign(aDiff) * (trailLength - 0.001);
        // debugMsg2.value = `tailValue: ${tailValue.toFixed(3)} >`;
      } else {
        tailValue += Math.sign(aDiff) * inc;
        // debugMsg2.value = `tailValue: ${tailValue.toFixed(3)} < ${aDiff.toFixed(3)}`;
      }

      if (isWrapped) {
        // eslint-disable-next-line react-compiler/react-compiler
        tailT.value = ((tailValue % 1) + 1) % 1;
      } else {
        tailT.value = tailValue;
      }

      // debugMsg.value = `head: ${headValue.toFixed(3)}`;
      // debugMsg2.value = `tail: ${tailValue.toFixed(3)} diff ${aDiff.toFixed(3)} `;
    }

    if (pathSections) {
      updatePathSections(
        pathSections,
        tailValue,
        headValue,
        trailDivisions,
        isWrapped
      );
      // debugMsg2.value = `t: ${tailValue.toFixed(3)} h: ${headValue.toFixed(3)} ${aDiff.toFixed(3)}`;

      // const { start: start1, end: end1 } = pathSections.sections[0];
      // const { start: start2, end: end2 } = pathSections.sections[1];
      // const { start: start3, end: end3 } = pathSections.sections[2];
      // debugMsg3.value = `start1: ${start1.value.toFixed(3)} end1: ${end1.value.toFixed(3)}`;
      // debugMsg4.value = `start2: ${start2.value.toFixed(3)} end2: ${end2.value.toFixed(3)}`;
      // debugMsg5.value = `start3: ${start3.value.toFixed(3)} end3: ${end3.value.toFixed(3)}`;
    }
  });

  return (
    <>
      {pathSections?.sections.map((section, index) => (
        <Path
          {...pathProps}
          key={index}
          start={section.start}
          end={section.end}
          color={section.color}
        >
          {hasGlow && <BlurMask blur={20} style='solid' />}
        </Path>
      ))}
    </>
  );
};
