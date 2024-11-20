import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState
} from 'react';
import { StyleSheet } from 'react-native';

import {
  Canvas,
  Group,
  Path,
  Rect,
  Skia,
  useCanvasRef,
  type PathProps,
  type SkPath,
  type SkiaDefaultProps
} from '@shopify/react-native-skia';
import { GestureDetector } from 'react-native-gesture-handler';
import {
  Easing,
  runOnJS,
  useAnimatedReaction,
  useSharedValue,
  withRepeat,
  withTiming
} from 'react-native-reanimated';

import { createLogger } from '@helpers/log';
import { useStore, useStoreViewDims } from '@model/useStore';
import { useStoreActions } from '@model/useStoreActions';
import type { Position } from '@types';
import { simplify } from '../../helpers/simplify';
import { TrailPath } from '../PathView/TrailPath';
import { useGestures } from './useGestures';

// import { DrawViewRef } from './types';
// import { useGestures } from './useGestures';

export type DrawViewProps = React.PropsWithChildren<{
  onReady?: () => void;
}>;

const log = createLogger('DrawView');

type PathState = {
  id: string;
  length: number;
  path: SkPath;
};

export const DrawView = ({ children, onReady }: DrawViewProps) => {
  const canvasRef = useCanvasRef();
  const { gesture, paths, path } = useGestures();
  const [viewDims, setViewDims] = useState<Position | null>(null);

  const [simplifiedPath, setSimplifiedPath] = useState<PathState | null>(null);
  const [pathLength, setPathLength] = useState<number>(0);

  const viewMatrix = useSharedValue(Skia.Matrix());

  useAnimatedReaction(
    () => viewDims,
    (viewDims) => {
      if (!viewDims) {
        return;
      }
      runOnJS(log.debug)('viewDims', viewDims);
      viewMatrix.modify((m) => {
        m.identity();
        m.translate(viewDims[0] / 2, viewDims[1] / 2);
        return m;
      });
    }
  );

  // useEffect(() => {
  //   const p = Skia.Path.Make();
  //   p.moveTo(60, 60);
  //   p.lineTo(200, 300);
  //   p.lineTo(200, 400);
  //   p.lineTo(300, 600);

  //   setSimplifiedPath(p);
  //   setPathLength(3);
  // }, []);

  const applyPath = useCallback(
    (id: string, points: Position[], length: number) => {
      const simplified = simplify(points, 1, true);
      const skPath = Skia.Path.Make();

      skPath.moveTo(simplified[0][0], simplified[0][1]);
      // log.debug('moveTo', simplified[0][0], simplified[0][1]);
      for (let ii = 1; ii < simplified.length; ii++) {
        skPath.lineTo(simplified[ii][0], simplified[ii][1]);
        // log.debug('lineTo', simplified[ii][0], simplified[ii][1]);
      }

      // log.debug('path', length, 'simplified', simplified.length);

      setSimplifiedPath({ id, length, path: skPath });
      setPathLength(length);
    },
    [path]
  );

  useAnimatedReaction(
    () => path.value,
    ({ id, length, points, isClosed }) => {
      if (isClosed) {
        runOnJS(applyPath)(id, points, length);
        // runOnJS(log.debug)('path', length, isClosed);
      }
    }
  );

  // log.debug('render');
  return (
    <>
      <GestureDetector gesture={gesture}>
        <Canvas
          style={styles.canvas}
          ref={canvasRef}
          onLayout={(event) => {
            const { width, height } = event.nativeEvent.layout;
            setViewDims([width, height]);
          }}
        >
          {viewDims && (
            <Group>
              {children}
              <Rect x={0} y={0} width={100} height={100} color='red' />
              {/* {paths.map((p, index) => (
                <Path
                  key={index}
                  path={p.segments.join(' ')}
                  strokeWidth={5}
                  style='stroke'
                  color={p.color}
                />
              ))} */}
              {simplifiedPath && (
                <DrawTrail
                  key={`dt-${simplifiedPath.id}`}
                  path={simplifiedPath.path}
                  length={simplifiedPath.length}
                  strokeWidth={5}
                  style='stroke'
                  color='lightblue'
                />
              )}
            </Group>
          )}
        </Canvas>
      </GestureDetector>
    </>
  );
};

type DrawTrailProps = SkiaDefaultProps<PathProps, 'start' | 'end'> & {
  path: SkPath;
  length: number;
};

const DrawTrail = ({ path, length, ...props }: DrawTrailProps) => {
  const t = useSharedValue(0);

  const isNew = length <= 2;

  useEffect(() => {
    // t.value = 0;
    t.value = withTiming(1, { duration: 2000, easing: Easing.linear }, () => {
      // t.value = 0;
    });
    // (t.value = withRepeat(
    //   withTiming(1, { duration: 3000, easing: Easing.linear }),
    //   -1,
    //   false
    // ));
    log.debug('[DrawTrail] onMount');
    // log.debug('restart', t.value, length);
  }, []);

  // return <Path path={path} {...props} />;
  // return (
  //   <TrailPath
  //     {...props}
  //     path={path}
  //     t={t}
  //     isFollow={true}
  //     trailDecay={0.01}
  //     trailLength={0.4}
  //     trailDivisions={2}
  //     tailColor='lightblue'
  //   />
  // );

  return (
    <TrailPath
      path={path}
      color='white'
      style='stroke'
      strokeWidth={5}
      t={t}
      trailLength={0.45}
      isFollow={true}
      trailDecay={0.3}
      isWrapped={false}
      trailDivisions={12}
      // tailColor='black'
      tailColor='#161e27'
    />
  );
};

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
    width: '100%'
  }
});
