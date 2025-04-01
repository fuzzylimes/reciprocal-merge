export const toPercent = (v: unknown): string => {
  return v ? `${(Number(v) * 100).toFixed(0)}%` : '0%'
}
