import { renderHook } from '@testing-library/react-native';
import { updatePathSections } from '../updatePathSections';
import { usePathSections } from '../usePathSections';

describe('updatePathSections', () => {
  test('should update a single section', () => {
    const sections = renderHook(() => usePathSections(2)).result.current;

    expect(sections[0].start.value).toBeCloseTo(0);
    expect(sections[0].end.value).toBeCloseTo(0);

    updatePathSections(sections, 0, 0.4);

    expect(sections[0].start.value).toBeCloseTo(0);
    expect(sections[0].end.value).toBeCloseTo(0.4);
  });

  test('should update a late single section', () => {
    const sections = renderHook(() => usePathSections(2)).result.current;

    updatePathSections(sections, 0.9, 0);

    expect(sections[0].start.value).toBeCloseTo(0.9);
    expect(sections[0].end.value).toBeCloseTo(1);
    expect(sections[1].start.value).toBeCloseTo(0);
    expect(sections[1].end.value).toBeCloseTo(0);
  });

  test('should update a late single section (reverse)', () => {
    const sections = renderHook(() => usePathSections(2)).result.current;

    updatePathSections(sections, 0.2, 1);

    expect(sections[0].start.value).toBeCloseTo(0);
    expect(sections[0].end.value).toBeCloseTo(0.2);
    expect(sections[1].start.value).toBeCloseTo(0);
    expect(sections[1].end.value).toBeCloseTo(0);
  });

  test('should return a single section in reverse', () => {
    const sections = renderHook(() => usePathSections(2)).result.current;

    updatePathSections(sections, 0.8, 0.4);

    expect(sections[0].start.value).toBeCloseTo(0.4);
    expect(sections[0].end.value).toBeCloseTo(0.8);
  });

  test('should clear when same negative values', () => {
    const sections = renderHook(() => usePathSections(2)).result.current;

    updatePathSections(sections, -1, -1);

    expect(sections[0].start.value).toBeCloseTo(0);
    expect(sections[0].end.value).toBeCloseTo(0);
    expect(sections[1].start.value).toBeCloseTo(0);
    expect(sections[1].end.value).toBeCloseTo(0);
  });

  test('should return a single section in reverse (negative)', () => {
    const sections = renderHook(() => usePathSections(2)).result.current;

    updatePathSections(sections, -0.1, -0.4);

    expect(sections[0].start.value).toBeCloseTo(0.6);
    expect(sections[0].end.value).toBeCloseTo(0.9);
  });

  test('should return an additional section when crossing over 0', () => {
    const sections = renderHook(() => usePathSections(2)).result.current;

    updatePathSections(sections, 0.8, 0.2);

    expect(sections[0].start.value).toBeCloseTo(0.8);
    expect(sections[0].end.value).toBeCloseTo(1);

    expect(sections[1].start.value).toBeCloseTo(0);
    expect(sections[1].end.value).toBeCloseTo(0.2);
  });

  test('should return an additional section when crossing over 0 (negative)', () => {
    const sections = renderHook(() => usePathSections(2)).result.current;

    updatePathSections(sections, -0.2, 0.2);

    expect(sections[0].start.value).toBeCloseTo(0.8);
    expect(sections[0].end.value).toBeCloseTo(1);

    expect(sections[1].start.value).toBeCloseTo(0);
    expect(sections[1].end.value).toBeCloseTo(0.2);
  });

  test('should return an additional section when reverse crossing over 0', () => {
    const sections = renderHook(() => usePathSections(2)).result.current;

    updatePathSections(sections, 0.2, 0.8);

    expect(sections[0].start.value).toBeCloseTo(0.8);
    expect(sections[0].end.value).toBeCloseTo(1);

    expect(sections[1].start.value).toBeCloseTo(0);
    expect(sections[1].end.value).toBeCloseTo(0.2);
  });

  test('should clear unused sections', () => {
    const sections = renderHook(() => usePathSections(2)).result.current;

    updatePathSections(sections, 0.8, 0.2);

    updatePathSections(sections, 0.2, 0.6);

    expect(sections[0].start.value).toBeCloseTo(0.2);
    expect(sections[0].end.value).toBeCloseTo(0.6);

    expect(sections[1].start.value).toBe(0);
    expect(sections[1].end.value).toBe(0);
  });
});
