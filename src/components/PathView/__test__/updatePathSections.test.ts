import { renderHook } from '@testing-library/react-native';
import { updatePathSections } from '../updatePathSections';
import { PathSections, usePathSections } from '../usePathSections';

describe('updatePathSections', () => {
  let sections: PathSections;

  describe('two division sections', () => {
    beforeEach(() => {
      sections = renderHook(() =>
        usePathSections({ count: 3, headColor: 'lightblue' })
      ).result.current!;
    });

    test('should result in multiple sections', () => {
      updatePathSections(sections, 0.6, 0.9, 2, true);
      const values = getPathSectionsValues(sections);
      expect(values).toEqual([0.6, 0.75, 0.75, 0.9, 0, 0]);
    });

    test('wrapped over 0', () => {
      updatePathSections(sections, 0.2, -0.1, 2, true);
      const values = getPathSectionsValues(sections);
      expect(values).toEqual([0.05, 0.2, 0, 0.05, 0.9, 1]);
    });

    test('stop at 0', () => {
      updatePathSections(sections, 0.143, 0, 2, true);
      const values = getPathSectionsValues(sections);
      expect(values).toEqual([0.07, 0.14, 0, 0.07, 0, 0]);
    });

    test('even wrap over 0', () => {
      updatePathSections(sections, 0.0084, -0.0084, 2, true);
      const values = getPathSectionsValues(sections);
      expect(values).toEqual([0, 0.01, 0, 0, 0.99, 1]);
    });
  });

  describe('multiple division sections', () => {
    beforeEach(() => {
      sections = renderHook(() =>
        usePathSections({ count: 5, headColor: 'lightblue' })
      ).result.current!;
    });

    test('should result in multiple sections', () => {
      updatePathSections(sections, 0, 1, 4, false);
      const values = getPathSectionsValues(sections);
      expect(values).toEqual([0, 0.25, 0.25, 0.5, 0.5, 0.75, 0.75, 1, 0, 0]);
    });
    test('should result in multiple sections (reversed)', () => {
      updatePathSections(sections, 1, 0, 4, false);
      const values = getPathSectionsValues(sections);
      expect(values).toEqual([0.75, 1, 0.5, 0.75, 0.25, 0.5, 0, 0.25, 0, 0]);
    });
  });

  describe('non wrapped sections', () => {
    beforeEach(() => {
      sections = renderHook(() =>
        usePathSections({ count: 2, headColor: 'lightblue' })
      ).result.current!;
    });

    test('should update a single section', () => {
      updatePathSections(sections, 0, 1, 1, false);

      expect(getPathSectionsValues(sections)).toEqual([0, 1, 0, 0]);
    });

    test('should update a single section', () => {
      updatePathSections(sections, 0.9, 0.1, 1, false);

      expect(getPathSectionsValues(sections)).toEqual([0.1, 0.9, 0, 0]);
    });
  });

  describe('wrapped sections', () => {
    beforeEach(() => {
      sections = renderHook(() =>
        usePathSections({ count: 2, headColor: 'lightblue' })
      ).result.current!;
    });

    test('should update a single section', () => {
      expect(getPathSectionsValues(sections)).toEqual([0, 0, 0, 0]);

      updatePathSections(sections, 0, 0.4);

      expect(getPathSectionsValues(sections)).toEqual([0, 0.4, 0, 0]);
    });

    test('should update a late single section', () => {
      updatePathSections(sections, 0.9, 0);

      expect(getPathSectionsValues(sections)).toEqual([0.9, 1, 0, 0]);
    });

    test('should update a late single section (reverse)', () => {
      updatePathSections(sections, 0.2, 1);

      expect(getPathSectionsValues(sections)).toEqual([0, 0.2, 0, 0]);
    });

    test('should return a single section in reverse', () => {
      updatePathSections(sections, 0.8, 0.4);

      expect(getPathSectionsValues(sections)).toEqual([0.4, 0.8, 0, 0]);
    });

    test('should clear when same negative values', () => {
      updatePathSections(sections, -1, -1);

      expect(getPathSectionsValues(sections)).toEqual([0, 0, 0, 0]);
    });

    test('should return a single section in reverse (negative)', () => {
      updatePathSections(sections, -0.1, -0.4);

      expect(getPathSectionsValues(sections)).toEqual([0.6, 0.9, 0, 0]);
    });

    test('should return an additional section when crossing over 0', () => {
      updatePathSections(sections, 0.8, 0.2);

      expect(getPathSectionsValues(sections)).toEqual([0.8, 1, 0, 0.2]);
    });

    test('should return an additional section when crossing over 0 (negative)', () => {
      updatePathSections(sections, -0.2, 0.2);

      expect(getPathSectionsValues(sections)).toEqual([0.8, 1, 0, 0.2]);
    });

    test('should return an additional section when reverse crossing over 0', () => {
      updatePathSections(sections, 0.2, 0.8);

      expect(getPathSectionsValues(sections)).toEqual([0, 0.2, 0.8, 1]);
    });

    test('should clear unused sections', () => {
      updatePathSections(sections, 0.8, 0.2);

      updatePathSections(sections, 0.2, 0.6);

      expect(getPathSectionsValues(sections)).toEqual([0.2, 0.6, 0, 0]);
    });
  });
});

const roundNumberToTwoDecimals = (n: number) => Math.round(n * 100) / 100;
const getPathSectionsValues = (sections: PathSections) =>
  sections.sections
    .map((s) => [
      roundNumberToTwoDecimals(s.start.value),
      roundNumberToTwoDecimals(s.end.value)
    ])
    .flat();
