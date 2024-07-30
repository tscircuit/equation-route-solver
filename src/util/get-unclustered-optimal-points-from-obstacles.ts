import type { Obstacle, Point } from "../types"
import { computeOptimalPoints } from "./compute-optimal-points"
import { getDistanceToSegment } from "./get-distance-to-segment"

export const getUnclusteredOptimalPointsFromObstacles = (
  obstacles: Obstacle[],
  margin: number = 0,
): Point[] => {
  const optimalPoints: Point[] = []

  for (const obstacle of obstacles) {
    optimalPoints.push(
      ...computeOptimalPoints(obstacle, margin).filter((p) => {
        for (const obstacle of obstacles) {
          if (obstacle.obstacleType === "line") {
            const [start, end] = obstacle.linePoints
            if (
              getDistanceToSegment(p, {
                x1: start.x,
                y1: start.y,
                x2: end.x,
                y2: end.y,
              }) < 0.02
            ) {
              return false
            }
          }
        }
        return true
      }),
    )
  }

  const unclusteredOptimalPoints: Array<Point & { count: number }> = []
  for (let i = 0; i < optimalPoints.length; i++) {
    const p1 = optimalPoints[i]
    let closePoint: (Point & { count: number }) | null = null

    for (let j = 0; j < unclusteredOptimalPoints.length; j++) {
      const p2 = unclusteredOptimalPoints[j]
      const dsq = (p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2
      if (dsq < 0.02 ** 2) {
        closePoint = p2
        break
      }
    }

    if (!closePoint) {
      unclusteredOptimalPoints.push({ ...p1, count: 1 })
    } else if (closePoint) {
      closePoint.x =
        (closePoint.x * closePoint.count + p1.x) / (closePoint.count + 1)
      closePoint.y =
        (closePoint.y * closePoint.count + p1.y) / (closePoint.count + 1)
      closePoint.count += 1
    }
  }

  return unclusteredOptimalPoints
}
