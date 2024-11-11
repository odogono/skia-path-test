import { createContext } from 'react';

import type { BBox, Mutable, Position } from '@types';
import { Store } from '../Store';

export type StoreContextType = {
  store: Store;
  mViewPosition: Mutable<Position>;
  mViewScale: Mutable<number>;
  mViewBBox: Mutable<BBox>;

  screenToWorld: (point: Position) => Position;

  zoomOnPoint: (
    focalPoint: Position,
    zoomFactor: number,
    duration?: number
  ) => void;
  worldToScreen: (point: Position) => Position;
};

export const StoreContext = createContext<StoreContextType | null>(null);
