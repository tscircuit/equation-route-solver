import React, { useState } from "react"
import { Visualization } from "./fixtures/Visualization"
import { computeOptimalPoints } from "../util/compute-optimal-points"
import type { LineObstacle, Obstacle, Point } from "../types"
import { getDistanceToSegment } from "../util/get-distance-to-segment"

const targets = [
  {
    x: -0.5,
    y: 0,
    color: "green",
  },
  {
    x: 0.5,
    y: 0,
    color: "green",
  },
]

export const BFSOptimalPoints = () => {
  const scenario = {
    points: targets,
    obstacles: [
      {
        obstacleType: "line",
        linePoints: [
          { x: 0, y: -0.8 },
          { x: 0, y: 0.3 },
        ],
        width: 0.01,
      },
      {
        obstacleType: "line",
        linePoints: [
          { x: -0.2, y: 0.5 },
          { x: -0.1, y: 0.3 },
        ],
        width: 0.01,
      },
      {
        obstacleType: "line",
        linePoints: [
          { x: -0.1, y: -0.3 },
          { x: 0, y: 0 },
        ],
        width: 0.01,
      },
    ] as LineObstacle[],
  }

  let optimalPoints = scenario.obstacles
    .flatMap((obstacle: LineObstacle) => computeOptimalPoints(obstacle, 0.02))
    // Remove points that are too close to obstacles
    .filter((p) => {
      for (const obstacle of scenario.obstacles) {
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
    })

  // Remove optimal points that are too close to other optimal points
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

    // for (let j = i + 1; j < optimalPoints.length; j++) {
    //   const p2 = optimalPoints[j]
    //   const dsq = (p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2
    //   if (dsq < 0.02 ** 2) {
    //     closePoint = p2
    //     break
    //   }
    // }
    // if (!closePoint) {
    //   unclusteredOptimalPoints.push(p1)
    // } else if (closePoint) {

    // }
  }

  return (
    <Visualization
      obstacles={scenario.obstacles}
      fn={() => 0}
      points={unclusteredOptimalPoints.map((p) => ({ ...p, color: "blue" }))}
    />
  )
}
