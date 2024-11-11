import { useStoreState } from '@model/useStore';
import { Group, Rect } from '@shopify/react-native-skia';

export const PathView = () => {
  const [mViewMatrix, mViewBBox] = useStoreState((state) => [
    state.mViewMatrix,
    state.mViewBBox
  ]);

  return (
    <Group matrix={mViewMatrix}>
      <Rect x={0} y={0} width={100} height={100} color='red' />
    </Group>
  );
};
