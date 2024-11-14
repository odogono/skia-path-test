import { runOnJS, runOnUI } from 'react-native-reanimated';

import { getAngularDiff } from '@helpers/getAngularDiff';
import { debugMsg2, debugMsg } from '@helpers/global';
import { PathSections } from './usePathSections';

export const updatePathSections = (
  sections: PathSections,
  start: number,
  end: number,
  divisions: number = 1,
  isWrapped: boolean = true
) => {
  'worklet';
  if (sections.sections.length === 0) {
    return sections;
  }

  const wrap = (t: number) => ((t % 1) + 1) % 1;

  let si = 0;
  const diff = isWrapped ? getAngularDiff(start, end) : end - start;

  const divInc = diff / divisions;

  // console.log('divInc', divInc);

  for (let ii = 0; ii < divisions; ii++) {
    let section = sections.sections[si++];

    let st = start + divInc * ii;
    let en = start + divInc * (ii + 1);

    // const color = new Float32Array(sections.color
    // section.color.value

    if (isWrapped) {
      st = wrap(st);
      en = wrap(en);
    }

    // console.log(si - 1, 'st', st);
    // console.log(si - 1, 'en', en);
    // console.log('diff', diff);

    if (en === 0 && st > 0.5 && diff < 0.5) {
      en = 1;
    }

    if (isWrapped && st + diff > 1) {
      section.start.value = st;
      section.end.value = 1;
      section = sections.sections[si++];
      section.start.value = 0;
      section.end.value = en;
    } else if (isWrapped && st + diff < 0) {
      section.start.value = en;
      section.end.value = 1;
      section = sections.sections[si++];

      section.start.value = 0;
      section.end.value = st;
    } else if (st > en) {
      section.start.value = en;
      section.end.value = st;
    } else {
      section.start.value = st;
      section.end.value = en;
    }

    const color = sections.color;

    // note: section.color.modify does not work
    section.color.value = new Float32Array(color);
    section.color.value[1] = (1.0 / divisions) * (ii + 1);
  }

  while (si < sections.sections.length) {
    let section = sections.sections[si++];
    section.start.value = 0;
    section.end.value = 0;
  }

  return sections;
};
