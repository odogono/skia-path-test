import { getAngularDiff } from '@helpers/getAngularDiff';
import { PathSection } from './usePathSections';

export const updatePathSections = (
  sections: PathSection[],
  start: number,
  end: number,
  divisions: number = 1
) => {
  'worklet';
  if (sections.length === 0) {
    return sections;
  }

  const wrap = (t: number) => ((t % 1) + 1) % 1;

  let si = 0;
  const diff = getAngularDiff(start, end);

  for (let ii = 0; ii < divisions; ii++) {
    let section = sections[si];
    let st = wrap(start + (diff * ii) / divisions);
    let en = wrap(start + (diff * (ii + 1)) / divisions);

    if (en === 0 && st > 0.5 && diff < 0.5) {
      en = 1;
    }

    // console.log('st', st);
    // console.log('en', en);
    // console.log('diff', diff);

    if (st + diff > 1) {
      section.start.value = st;
      section.end.value = 1;
      section = sections[++si];
      section.start.value = 0;
      section.end.value = en;
    } else if (st + diff < 0) {
      section.start.value = en;
      section.end.value = 1;
      section = sections[++si];
      section.start.value = 0;
      section.end.value = st;
    } else if (st > en) {
      section.start.value = en;
      section.end.value = st;
    } else {
      section.start.value = st;
      section.end.value = en;
    }
  }

  while (++si < sections.length) {
    let section = sections[si];
    section.start.value = 0;
    section.end.value = 0;
  }

  return sections;
};
