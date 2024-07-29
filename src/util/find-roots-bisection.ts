/**
 * Finds roots of a polynomial equation within a given interval using the bisection method.
 * @param f - The polynomial function
 * @param a - Start of the interval
 * @param b - End of the interval
 * @returns Array of roots found within the interval
 */

export function findRootsBisection(
  f: (x: number) => number,
  a: number,
  b: number,
): number[] {
  const roots: number[] = []
  const epsilon = 1e-6
  const maxIterations = 100
  const step = (b - a) / 1000

  for (let x = a; x <= b; x += step) {
    let left = x
    let right = x + step
    let fLeft = f(left)
    let fRight = f(right)

    if (fLeft * fRight > 0) continue

    for (let i = 0; i < maxIterations; i++) {
      const mid = (left + right) / 2
      const fMid = f(mid)

      if (Math.abs(fMid) < epsilon) {
        roots.push(mid)
        break
      }

      if (fLeft * fMid < 0) {
        right = mid
        fRight = fMid
      } else {
        left = mid
        fLeft = fMid
      }
    }
  }

  return roots
}
