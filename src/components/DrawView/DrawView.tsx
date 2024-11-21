import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState
} from 'react';
import { StyleSheet } from 'react-native';

import {
  Canvas,
  Group,
  Path,
  Rect,
  SkContourMeasure,
  SkPoint,
  Skia,
  useCanvasRef,
  type PathProps,
  type SkPath,
  type SkiaDefaultProps
} from '@shopify/react-native-skia';
import { GestureDetector } from 'react-native-gesture-handler';
import {
  Easing,
  SharedValue,
  runOnJS,
  useAnimatedReaction,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming
} from 'react-native-reanimated';

import { TrailPath } from '@components/PathView/TrailPath';
import { ContourMeasure } from '@components/PathView/types';
import { createLogger } from '@helpers/log';
import type { Mutable, Position } from '@types';
import { setAnimatedTimeout } from '../../helpers/animatedTimeout';
import { simplify } from '../../helpers/simplify';
import { PathState } from './types';
import { useGestures } from './useGestures';
import { usePathStates } from './usePathStates';

// import { DrawViewRef } from './types';
// import { useGestures } from './useGestures';

export type DrawViewProps = React.PropsWithChildren<{
  onReady?: () => void;
}>;

const log = createLogger('DrawView');

export const DrawView = ({ children, onReady }: DrawViewProps) => {
  const canvasRef = useCanvasRef();
  const { gesture, paths, isPathsInited } = useGestures();
  const [viewDims, setViewDims] = useState<Position | null>(null);

  // const [pathStates, setPathStates] = useState<PathState[]>([]);

  // const [simplifiedPath, setSimplifiedPath] = useState<PathState | null>(null);
  // const [pathLength, setPathLength] = useState<number>(0);
  // const { applyPath, inc, states: pathStates } = usePathStates();

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

  // const applyPath = useCallback(
  //   (id: string, points: Position[], length: number) => {
  //     const simplified = simplify(points, 1, true);
  //     const skPath = Skia.Path.Make();

  //     skPath.moveTo(simplified[0][0], simplified[0][1]);
  //     // log.debug('moveTo', simplified[0][0], simplified[0][1]);
  //     for (let ii = 1; ii < simplified.length; ii++) {
  //       skPath.lineTo(simplified[ii][0], simplified[ii][1]);
  //       // log.debug('lineTo', simplified[ii][0], simplified[ii][1]);
  //     }

  //     log.debug('path', length, 'simplified', simplified.length);

  //     const it = Skia.ContourMeasureIter(skPath, false, 1);
  //     const contour = it.next();
  //     const totalLength = contour?.length() ?? 0;
  //     const [pos, tan] = contour?.getPosTan(totalLength) ?? [
  //       { x: 0, y: 0 },
  //       { x: 0, y: 0 }
  //     ];

  //     setSimplifiedPath({
  //       id,
  //       length,
  //       path: skPath,
  //       headPos: pos,
  //       headTan: tan
  //     });
  //     setPathLength(length);
  //   },
  //   [path]
  // );

  // useEffect(() => {
  //   log.debug('gPathState', gPathState.id, gPathState.isInUse);
  // }, []);

  // react to a changing path value
  // useAnimatedReaction(
  //   () => path.value,
  //   ({ id, points, isClosed }) => {
  //     if (isClosed) {
  //       // runOnJS(applyPath)(id, points, length);
  //       applyPath(id, points);
  //       runOnJS(log.debug)('path', id, points.length, isClosed);
  //     }
  //   }
  // );

  // const updatePathStates = useCallback((states: PathState[]) => {
  //   // setPathStates(states);
  // }, []);

  // useAnimatedReaction(
  //   () => pathStates.value,
  //   (states) => {
  //     runOnJS(log.debug)('states', states.length);
  //     // runOnJS(setPathStates)(states);
  //     setAnimatedTimeout(() => {
  //       runOnJS(log.debug)('states', states.length);
  //       // runOnJS(setPathStates)(states);
  //     }, 1000);
  //   }
  // );

  // useAnimatedReaction(
  //   () => [inc.value, states.value] as [number, PathState[]],
  //   ([inc, states]) => {
  //     const filtered = states.filter((s) => s.isInUse);
  //     runOnJS(log.debug)('states updated', inc, filtered?.length);
  //     // runOnJS(updatePathStates)(filtered);
  //   }
  // );

  // useAnimatedReaction(
  //   () => paths.value,
  //   (states) => {
  //     runOnJS(log.debug)('paths', states.length);
  //   }
  // );

  log.debug('render', { isPathsInited }, paths.length);
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
              {paths.map((state) => (
                <DrawTrail
                  key={`dt-${state.id}`}
                  {...state}
                  strokeWidth={5}
                  style='stroke'
                  color='lightblue'
                />
              ))}
            </Group>
          )}
        </Canvas>
      </GestureDetector>
    </>
  );
};

type DrawTrailProps = SkiaDefaultProps<PathProps, 'start' | 'end'> & PathState;

const DrawTrail = ({
  path,
  length,
  headPos,
  headTan,
  id,
  isInUse,
  ...props
}: DrawTrailProps) => {
  const t = useSharedValue(0);
  const tailValue = useSharedValue(0);
  const [showArrowHead, setShowArrowHead] = useState(true);
  // const { position, tangent } = usePathPosition(path, t);

  // called when the path changes its isInUse value
  useAnimatedReaction(
    () => isInUse.value,
    (isInUse) => {
      runOnJS(log.debug)('>isInUse DrawTrail', id, isInUse);

      if (isInUse) {
        // this trail has become active - so reset the various animated values
        t.value = 0;
        tailValue.value = 0;
        t.value = withTiming(1, { duration: 100, easing: Easing.linear });
        runOnJS(setShowArrowHead)(true);
      }
    }
  );

  useAnimatedReaction(
    () => tailValue.value,
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
        t={t}
        tailValue={tailValue}
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

const ArrowHead = ({
  position,
  tangent
}: {
  position: Mutable<SkPoint>;
  tangent: Mutable<SkPoint>;
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
      <Path path={path} color='white' style='fill' />
    </Group>
  );
};

const usePathPosition = (path: SkPath, t: SharedValue<number>) => {
  const position = useSharedValue<Position>([0, 0]);
  const tangent = useSharedValue<Position>([0, 0]);
  const contourMeasure = useSharedValue<ContourMeasure>([null, 0]);

  useEffect(() => {
    const it = Skia.ContourMeasureIter(path, false, 1);
    const contour: SkContourMeasure = it.next();
    const totalLength = contour?.length() ?? 0;
    contourMeasure.value = [contour, totalLength] as ContourMeasure;
  }, [path]);

  useAnimatedReaction(
    () => t.value,
    (t) => {
      const [contour, totalLength] = contourMeasure.value;
      const length = t * totalLength;
      const [pos, tan] = contour?.getPosTan(length) ?? [
        { x: 0, y: 0 },
        { x: 0, y: 0 }
      ];

      position.value = [pos.x, pos.y];
      tangent.value = [tan.x, tan.y];
    }
  );

  return { position, tangent };
};

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
    width: '100%'
  }
});
