import React, { useState } from "react"
import { Visualization } from "./fixtures/Visualization"
import { computeOptimalPoints } from "../util/compute-optimal-points"
import type { LineObstacle, Obstacle, Point } from "../types"
import { getDistanceToSegment } from "../util/get-distance-to-segment"
import { getUnclusteredOptimalPointsFromObstacles } from "../util/get-unclustered-optimal-points-from-obstacles"

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

  return (
    <Visualization
      obstacles={scenario.obstacles}
      points={scenario.points.concat(
        getUnclusteredOptimalPointsFromObstacles(scenario.obstacles, 0.02).map(
          (p) => ({ ...p, color: "blue" }),
        ),
      )}
    />
  )
}
