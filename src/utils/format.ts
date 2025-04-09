export const toPercent = (v: unknown) => {
  return v ? Math.round(Number(v) * 100) / 100 : undefined;
}
