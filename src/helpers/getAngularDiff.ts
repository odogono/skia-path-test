export const getAngularDiff = (t1: number, t2: number) => {
  if (t1 === t2) {
    return 0;
  }

  // Direct difference
  const directDiff = t2 - t1;

  // Calculate differences going both ways around the circle
  const diff1 = directDiff > 0 ? directDiff : directDiff + 1;
  const diff2 = directDiff > 0 ? directDiff - 1 : directDiff;

  // Return the difference with smaller absolute value
  return Math.abs(diff1) < Math.abs(diff2) ? diff1 : diff2;
};
