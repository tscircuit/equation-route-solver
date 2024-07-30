/**
 * Finds roots of a function using the Newton-Raphson method.
 * @param f - The function
 * @param a - Start of the interval
 * @param b - End of the interval
 * @returns Array of roots found within the interval
 */

export function findRootsNewtonRaphson(
  f: (x: number) => number,
  a: number,
  b: number,
): number[] {
  const roots: number[] = []
  const epsilon = 1e-6
  const maxIterations = 20
  const samples = 10

  for (let i = 0; i <= samples; i++) {
    let x = a + (b - a) * (i / samples)
    for (let j = 0; j < maxIterations; j++) {
      const fx = f(x)
      if (Math.abs(fx) < epsilon) {
        if (!roots.some((r) => Math.abs(r - x) < epsilon)) {
          roots.push(x)
        }
        break
      }
      const dfx = (f(x + epsilon) - fx) / epsilon // Numerical differentiation
      if (dfx === 0) break
      x = x - fx / dfx
      if (x < a || x > b) break
    }
  }

  return roots
}
