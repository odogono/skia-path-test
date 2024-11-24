import type { SkPoint } from '@shopify/react-native-skia';
import { Gesture } from 'react-native-gesture-handler';
import { useSharedValue } from 'react-native-reanimated';

type UseDrawGestureProps = {
  startPath: (point: SkPoint) => number;
  updatePath: (stateIndex: number, point: SkPoint) => number;
  endPath: (stateIndex: number) => void;
};

export const useDrawGesture = ({
  startPath,
  updatePath,
  endPath
}: UseDrawGestureProps) => {
  const pathInUseIndex = useSharedValue(0);

  const pan = Gesture.Pan()
    .onStart((g) => {
      pathInUseIndex.value = startPath(g);
    })
    .onUpdate((g) => {
      updatePath(pathInUseIndex.value, g);
    })
    .onEnd(() => {
      endPath(pathInUseIndex.value);
    })
    .minDistance(1);

  return pan;
};
