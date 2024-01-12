export function toNumeric(n: string): number {
  const parsed = +n
  return isNaN(parsed) ? 0 : parsed
}
