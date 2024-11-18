import {
  interpolate,
  interpolateColor,
  runOnJS,
  runOnUI
} from 'react-native-reanimated';

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

    // console.log(si - 1, 'st', st.toFixed(3));
    // console.log(si - 1, 'en', en.toFixed(3));
    // console.log('diff', divInc.toFixed(3), 'sec', sections.sections.length);

    if (en === 0 && st > 0.5 && diff < 0.5) {
      en = 1;
    }

    const stDivInc = Math.round((st + divInc) * 10000) / 10000;

    if (isWrapped && stDivInc > 1) {
      // console.log('st + diff > 1');
      section.start.value = st;
      section.end.value = 1;
      section = sections.sections[si++];
      section.start.value = 0;
      section.end.value = en;
    } else if (isWrapped && stDivInc < 0) {
      // console.log('st + diff < 0', si, stDivInc.toFixed(9));
      section = sections.sections[si];
      section.start.value = en;
      section.end.value = 1;
      section = sections.sections[si - 1];
      section.start.value = 0;
      section.end.value = st;
      si++;
    } else if (st > en) {
      // console.log('st > en');
      section.start.value = en;
      section.end.value = st;
    } else {
      // console.log('else');
      section.start.value = st;
      section.end.value = en;
    }

    const hColor = sections.headColor;
    const tColor = sections.tailColor;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const cubic = (a: number, b: number, t: number) =>
      a + (b - a) * t * t * (3 - 2 * t);
    const smooth = (a: number, b: number, t: number) =>
      a + (b - a) * (3 - t * t) * t * t * 0.5;

    const color = [0, 0, 0, 0];
    color[0] = cubic(tColor[0], hColor[0], ii / divisions);
    color[1] = cubic(tColor[1], hColor[1], ii / divisions);
    color[2] = cubic(tColor[2], hColor[2], ii / divisions);
    color[3] = cubic(tColor[3], hColor[3], ii / divisions);
    section.color.value = new Float32Array(color);
  }

  while (si < sections.sections.length) {
    let section = sections.sections[si++];
    section.start.value = 0;
    section.end.value = 0;
  }

  return sections;
};
