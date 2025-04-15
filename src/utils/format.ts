export const toDecimalPercent = (v: unknown): number => {
  if (isNaN(Number(v))) return 0;
  return Number(Number(v).toFixed(2));
}
