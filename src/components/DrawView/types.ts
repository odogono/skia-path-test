import { SkPath, SkPoint } from '@shopify/react-native-skia';

import { Mutable } from '@types';

export type PathState = {
  id: string;
  isInUse: Mutable<boolean>;
  length: number;
  path: Mutable<SkPath>;
  headPos: Mutable<SkPoint>;
  headTan: Mutable<SkPoint>;
};
