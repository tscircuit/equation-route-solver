import { findRootsBisection } from "./find-roots-bisection"

/**
 * Finds the intersection points between a polynomial curve and a line segment.
 * @param W - Array of polynomial coefficients [a0, a1, a2, ..., an] where y = a0 + a1*x + a2*x^2 + ... + an*x^n
 * @param x1 - x-coordinate of the first point of the line segment
 * @param y1 - y-coordinate of the first point of the line segment
 * @param x2 - x-coordinate of the second point of the line segment
 * @param y2 - y-coordinate of the second point of the line segment
 * @returns Array of intersection points, or null if no intersection
 */
export function getPolynomialLineIntersection(
  W: number[],
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): [number, number][] | null {
  // Step 1: Find the line equation y = mx + b
  const m = (y2 - y1) / (x2 - x1)
  const b = y1 - m * x1

  // Step 2: Set up the polynomial equation
  const equation = (x: number) => {
    return (
      W.reduce((sum, coeff, power) => sum + coeff * Math.pow(x, power), 0) -
      (m * x + b)
    )
  }

  // Step 3: Find roots of the polynomial equation
  const roots = findRootsBisection(equation, Math.min(x1, x2), Math.max(x1, x2))

  // Step 4: Check if roots are within the line segment
  const intersections = roots
    .filter((x) => x >= Math.min(x1, x2) && x <= Math.max(x1, x2))
    .map((x) => [x, m * x + b] as [number, number])

  return intersections.length > 0 ? intersections : null
}
