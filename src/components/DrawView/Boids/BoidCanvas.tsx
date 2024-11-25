import { StyleSheet } from 'react-native';

import { Canvas, Group } from '@shopify/react-native-skia';

import { useViewDims } from '@helpers/useViewDims';
import { BoidSprite } from './BoidSprite';
import { useBoids } from './useBoids';

export const BoidCanvas = ({ count = 5 }: { count?: number }) => {
  const { viewDims, setViewDims, areViewDimsValid } = useViewDims();

  const { boids } = useBoids({
    count,
    width: viewDims.width,
    height: viewDims.height
  });

  return (
    <Canvas
      style={styles.canvas}
      onLayout={(event) => {
        setViewDims(event.nativeEvent.layout);
      }}
    >
      {areViewDimsValid && (
        <Group>
          {boids.map((boid, index) => (
            <BoidSprite key={index} boid={boid} />
          ))}
        </Group>
      )}
    </Canvas>
  );
};

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
    width: '100%'
  }
});
