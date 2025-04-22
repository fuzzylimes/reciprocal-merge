// I honestly hate this, but it seems to do what it needs to
export const toDecimalPercent = (v: unknown, d: number = 2): number => {
  if (isNaN(Number(v))) return 0;
  return Number(Math.round(parseFloat(String(v) + 'e' + d)) + 'e-' + d)
}
