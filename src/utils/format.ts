export const toDecimalPercent = (v: unknown) => {
  return isNaN(Number(v)) ? 0 : Math.round(Number(v) * 100) / 100;
}
