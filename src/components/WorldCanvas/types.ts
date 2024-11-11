import { Position } from '@types';

export type WorldCanvasRef = {
  setZoom: (zoomFactor: number) => void;
  setPosition: (worldPosition: Position) => void;
  moveToPosition: (worldPosition: Position, targetScale?: number) => void;
};
