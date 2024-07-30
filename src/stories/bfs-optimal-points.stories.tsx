import React, { useState } from "react"
import { Visualization } from "./fixtures/Visualization"
import { computeOptimalPoints } from "../util/compute-optimal-points"
import type { LineObstacle, Obstacle, Point } from "../types"
import { getDistanceToSegment } from "../util/get-distance-to-segment"
import { getUnclusteredOptimalPointsFromObstacles } from "../util/get-unclustered-optimal-points-from-obstacles"
import { getSegmentIntersection } from "../util/get-segment-intersection"
import { Graph } from "@dagrejs/graphlib"

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

  // Construct a graph from every point that can reach every other point
  const G = new Graph()
  for (let i = 0; i < optimalPoints.length; i++) {
    G.setNode(i.toString())
  }
  const start = { x: -0.5, y: 0, color: "green", nodeName: "START" }
  const end = { x: 0.5, y: 0, color: "green", nodeName: "END" }
  G.setNode("START")
  G.setNode("END")

  function addEdgeToGraph(p1: Point, p2: Point) {
    let intersection
    for (const obstacle of obstacles) {
      const [op1, op2] = obstacle.linePoints
      intersection = getSegmentIntersection(
        p1.x,
        p1.y,
        p2.x,
        p2.y,
        op1.x,
        op1.y,
        op2.x,
        op2.y,
      )
      if (intersection) break
    }

    if (!intersection) {
      // add to graph that these nodes are connected
      const d = ((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2) ** 0.5
      G.setEdge(p1.nodeName!, p2.nodeName!, { d })
    }
  }

  for (let i = 0; i < optimalPoints.length; i++) {
    for (let u = i + 1; u < optimalPoints.length; u++) {
      const p1 = optimalPoints[i]
      const p2 = optimalPoints[u]
      addEdgeToGraph(p1, p2)
    }
    addEdgeToGraph(optimalPoints[i], start)
    addEdgeToGraph(optimalPoints[i], end)
  }

  return (
    <Visualization
      obstacles={scenario.obstacles}
      points={scenario.points.concat(optimalPoints)}
    />
  )
}
