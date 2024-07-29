import { findRootsNewtonRaphson } from "./find-roots-newton-raphson"

/**
 * Represents a 2D point
 */
interface Point {
  x: number
  y: number
}

/**
 * Finds the intersection points between a cubic Bézier curve and a line segment.
 * @param p0 - Start point of the Bézier curve
 * @param p1 - First control point of the Bézier curve
 * @param p2 - Second control point of the Bézier curve
 * @param p3 - End point of the Bézier curve
 * @param l1 - Start point of the line segment
 * @param l2 - End point of the line segment
 * @returns Array of intersection points, or null if no intersection
 */
export function getBezierLineIntersection(
  p0: Point,
  p1: Point,
  p2: Point,
  p3: Point,
  l1: Point,
  l2: Point,
): Point[] | null {
  // Convert line segment to implicit form ax + by + c = 0
  const a = l2.y - l1.y
  const b = l1.x - l2.x
  const c = l2.x * l1.y - l1.x * l2.y

  // Define Bézier curve function
  const bezier = (t: number): Point => ({
    x:
      Math.pow(1 - t, 3) * p0.x +
      3 * Math.pow(1 - t, 2) * t * p1.x +
      3 * (1 - t) * Math.pow(t, 2) * p2.x +
      Math.pow(t, 3) * p3.x,
    y:
      Math.pow(1 - t, 3) * p0.y +
      3 * Math.pow(1 - t, 2) * t * p1.y +
      3 * (1 - t) * Math.pow(t, 2) * p2.y +
      Math.pow(t, 3) * p3.y,
  })

  // Define function to solve: ax(t) + by(t) + c = 0
  const f = (t: number): number => a * bezier(t).x + b * bezier(t).y + c

  // Find roots using numerical method (e.g., Newton-Raphson)
  const roots = findRootsNewtonRaphson(f, 0, 1)

  // Filter valid intersections
  const intersections = roots
    .map((t) => bezier(t))
    .filter(
      (p) =>
        p.x >= Math.min(l1.x, l2.x) &&
        p.x <= Math.max(l1.x, l2.x) &&
        p.y >= Math.min(l1.y, l2.y) &&
        p.y <= Math.max(l1.y, l2.y),
    )

  return intersections.length > 0 ? intersections : null
}
