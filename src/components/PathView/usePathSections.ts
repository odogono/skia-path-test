import { useEffect, useState } from 'react';

import { Color, Skia } from '@shopify/react-native-skia';
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
  headColor: Float32Array;
  tailColor: Float32Array;
  sections: Section[];
};

export type UsePathSectionsProps = {
  count: number;
  headColor: Color;
  tailColor?: Color | undefined;
};

export const usePathSections = (
  props: UsePathSectionsProps
): PathSections | null => {
  const [sections] = useState<PathSections>(() => createPathSections(props));
  const { count } = props;

  useEffect(() => {
    return () => {
      clearPathSections(sections);
    };
  }, [count]);

  return sections;
};

export const createPathSections = ({
  count,
  headColor,
  tailColor
}: UsePathSectionsProps): PathSections => {
  const hColor = Skia.Color(headColor);
  const tColor = Skia.Color(tailColor ?? headColor);
  return {
    start: 0,
    end: 0,
    headColor: hColor,
    tailColor: tColor,
    sections: Array.from({ length: count }).map(() => ({
      start: makeMutable(0),
      end: makeMutable(0),
      color: makeMutable(hColor)
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
