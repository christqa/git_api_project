const avg = (arr: number[]) =>
  arr.reduce((acc, v, i, a) => acc + v / a.length, 0);

const sum = (arr: number[]) => arr.reduce((a, b) => a + b);

export { avg, sum };
