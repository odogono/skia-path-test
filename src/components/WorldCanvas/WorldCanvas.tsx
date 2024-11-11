import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle
} from 'react';
import { StyleSheet } from 'react-native';

import { useContextBridge } from 'its-fine';
import { GestureDetector } from 'react-native-gesture-handler';

import { createLogger } from '@helpers/log';
import { useStore, useStoreViewDims } from '@model/useStore';
import { useStoreActions } from '@model/useStoreActions';
import { Canvas, useCanvasRef } from '@shopify/react-native-skia';
import { WorldCanvasRef } from './types';
import { useGestures } from './useGestures';

export type WorldCanvasProps = React.PropsWithChildren<{
  onReady?: () => void;
}>;

const log = createLogger('WorldCanvas');

export const WorldCanvas = forwardRef(
  (
    { children, onReady }: WorldCanvasProps,
    forwardedRef: React.Ref<WorldCanvasRef>
  ) => {
    const ContextBridge = useContextBridge();
    const canvasRef = useCanvasRef();

    const {
      setViewDims,
      width: viewWidth,
      height: viewHeight
    } = useStoreViewDims();

    const { moveToPosition, setViewPosition: setPosition } = useStoreActions();

    const { zoomOnPoint } = useStore();

    const { gesture, touchPointPos, touchPointVisible } = useGestures({});

    useImperativeHandle(forwardedRef, () => ({
      setZoom: (zoomFactor: number) => {
        zoomOnPoint([viewWidth / 2, viewHeight / 2], zoomFactor);
      },
      moveToPosition,
      setPosition
    }));

    useEffect(() => {
      if (viewWidth > 0 && viewHeight > 0) {
        onReady?.();
      }
    }, [onReady, viewWidth, viewHeight]);

    // the use of ContextBridge is because Canvas runs in a different fiber
    // and doesn't receive context as a result
    // see:
    // https://shopify.github.io/react-native-skia/docs/canvas/contexts/
    return (
      <>
        <GestureDetector gesture={gesture}>
          <Canvas
            style={styles.canvas}
            ref={canvasRef}
            onLayout={(event) => {
              const { width, height } = event.nativeEvent.layout;
              setViewDims(width, height);
            }}
          >
            <ContextBridge>{children}</ContextBridge>
          </Canvas>
        </GestureDetector>
      </>
    );
  }
);

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
    width: '100%'
  }
});
