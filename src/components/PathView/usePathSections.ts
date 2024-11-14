import { useEffect, useState } from 'react';

import { Color } from '@shopify/react-native-skia';
import { cancelAnimation, makeMutable } from 'react-native-reanimated';

import { Mutable } from '@types';

export type PathSection = {
  start: Mutable<number>;
  end: Mutable<number>;
  color: Mutable<Color>;
};

export const usePathSections = (count: number): PathSection[] => {
  const [sections, setSections] = useState<PathSection[]>([]);

  useEffect(() => {
    const items = createPathSections(count);

    setSections(items);

    return () => {
      clearPathSections(items);
    };
  }, [count]);

  return sections;
};

export const createPathSections = (count: number): PathSection[] => {
  return Array.from({ length: count }).map(() => ({
    start: makeMutable(0),
    end: makeMutable(0),
    color: makeMutable('lightblue' as Color)
  }));
};

export const clearPathSections = (sections: PathSection[]) => {
  sections.forEach((section) => {
    cancelAnimation(section.start);
    cancelAnimation(section.end);
    cancelAnimation(section.color);
  });
  return sections;
};
