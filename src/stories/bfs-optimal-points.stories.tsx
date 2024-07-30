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

function findOptimalPath(G: Graph, startNode: string, endNode: string) {
  const queue = [[startNode]]
  const visited = new Set()

  while (queue.length > 0) {
    const path: string[] | undefined = queue.shift()
    if (!path) break

    const node = path[path.length - 1]

    if (node === endNode) {
      return {
        path: path,
        distance: calculatePathDistance(G, path),
      }
    }

    if (!visited.has(node)) {
      visited.add(node)

      const neighbors = G.nodeEdges(node) || []
      for (const edge of neighbors) {
        const neighborNode = edge.w === node ? edge.v : edge.w
        if (!visited.has(neighborNode)) {
          queue.push([...path, neighborNode])
        }
      }
    }
  }

  return null // No path found
}

function calculatePathDistance(G: Graph, path: string[]) {
  let totalDistance = 0
  for (let i = 0; i < path.length - 1; i++) {
    const edge = G.edge(path[i], path[i + 1])
    totalDistance += edge.d
  }
  return totalDistance
}

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

  const optPath = findOptimalPath(G, "START", "END")

  return (
    <Visualization
      lines={G.edges()
        .map((e) => {
          const p1 = G.node(e.v)
          const p2 = G.node(e.w)
          return {
            points: [p1, p2],
            color: "rgba(0,0,255,0.1)",
          }
        })
        .concat(
          optPath?.path
            ?.map((nodeName, i) => {
              if (i === 0) return null as any
              const p1 = G.node(optPath.path[i - 1])
              const p2 = G.node(nodeName)
              return {
                points: [p1, p2],
                color: "rgba(0,255,0,0.5)",
              }
            })
            .filter(Boolean) || [],
        )}
      obstacles={scenario.obstacles}
      points={scenario.points.concat(optimalPoints)}
    />
  )
}
