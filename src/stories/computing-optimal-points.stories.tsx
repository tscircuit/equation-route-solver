import React, { useState } from "react"
import { Visualization } from "./fixtures/Visualization"
import { computeOptimalPoints } from "../util/compute-optimal-points"
import type { Obstacle, Point } from "../types"

export const ComputingOptimalPoints = () => {
  const [obstacle, setObstacle] = useState<Obstacle>({
    obstacleType: "line",
    linePoints: [
      { x: -0.4, y: -0.4 },
      { x: 0.4, y: 0.4 },
    ],
    width: 0.1,
  })

  const optimalPoints = computeOptimalPoints(obstacle)

  return (
    <Visualization
      obstacles={[obstacle]}
      fn={() => 0}
      points={optimalPoints.map((p) => ({ ...p, color: "blue" }))}
    />
  )
}
