import React, { useState } from "react"
import { Visualization } from "./fixtures/Visualization"
import { computeOptimalPoints } from "../util/compute-optimal-points"
import type { LineObstacle, Obstacle, Point } from "../types"
import { getDistanceToSegment } from "../util/get-distance-to-segment"
import { getUnclusteredOptimalPointsFromObstacles } from "../util/get-unclustered-optimal-points-from-obstacles"
import { getSegmentIntersection } from "../util/get-segment-intersection"
import { Graph } from "@dagrejs/graphlib"
import { constructGraphFromOptimalPoints } from "../util/construct-graph-from-optimal-points"

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
  const { obstacles } = scenario
  const optimalPoints = getUnclusteredOptimalPointsFromObstacles(
    scenario.obstacles,
    0.02,
  ).map((p, i) => ({ ...p, color: "blue", nodeName: i.toString() }))

  const G = constructGraphFromOptimalPoints(optimalPoints, obstacles)

  return (
    <Visualization
      lines={G.edges().map((e) => {
        const p1 = G.node(e.v)
        const p2 = G.node(e.w)
        return {
          points: [p1, p2],
          color: "rgba(0,0,255,0.1)",
        }
      })}
      obstacles={scenario.obstacles}
      points={scenario.points.concat(optimalPoints)}
    />
  )
}
