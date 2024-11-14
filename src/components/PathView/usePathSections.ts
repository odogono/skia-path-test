import { useEffect, useState } from 'react';

import { Skia } from '@shopify/react-native-skia';
import { cancelAnimation, makeMutable } from 'react-native-reanimated';

import { Mutable } from '@types';

type Section = {
  start: Mutable<number>;
  end: Mutable<number>;
  color: Mutable<Float32Array>;
};

export type PathSections = {
  start: number;
  end: number;
  color: Float32Array;
  sections: Section[];
};

export const usePathSections = (count: number): PathSections | null => {
  const [sections, setSections] = useState<PathSections | null>(null);

  useEffect(() => {
    const items = createPathSections(count);

    setSections(items);

    return () => {
      clearPathSections(items);
    };
  }, [count]);

  return sections;
};

export const createPathSections = (count: number): PathSections => {
  const color = Skia.Color('lightblue'); // new Float32Array([0.678, 0.847, 0.901, 1]);

  return {
    start: 0,
    end: 0,
    color,
    sections: Array.from({ length: count }).map(() => ({
      start: makeMutable(0),
      end: makeMutable(0),
      color: makeMutable(color)
    }))
  };
};

export const clearPathSections = (sections: PathSections) => {
  sections.sections.forEach((section) => {
    cancelAnimation(section.start);
    cancelAnimation(section.end);
    cancelAnimation(section.color);
  });
  return sections;
};
