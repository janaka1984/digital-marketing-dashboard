export const compactNumber = (n: number) =>
  Intl.NumberFormat(undefined, { notation: 'compact' }).format(n);
