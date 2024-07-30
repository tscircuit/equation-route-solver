import { useMemo, useState } from "react"
import { PolynomialLine } from "../polynomial-line"
import type { Obstacle, Point, Scenario } from "../types"
import { generateRandomTestData } from "../util/generate-random-test-data"
import useT from "./fixtures/use-t"
import { Visualization } from "./fixtures/Visualization"
import { getSegmentIntersection } from "../util/get-segment-intersection"
import { getDistanceToSegment } from "../util/get-distance-to-segment"
import { PolynomialSegmentSolver } from "../polynomial-segment-solver"
import type { Solver } from "../solver"

/**
 * Select midpoints of costPoints that don't collide with obstacles
 */
function computeFitPoints2(
  costPoints: Point[],
  obstacles: Obstacle[],
): Point[] {
  const fitPoints: Point[] = []

  function attemptToAddMidpoint(p1: Point, p2: Point) {
    const isCloseTogether = (p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2 < 0.02 ** 2

    if (isCloseTogether) return false

    const midpoint = {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2,
      color: "orange",
    }

    const q1Point = {
      x: (p1.x + midpoint.x) / 2,
      y: (p1.y + midpoint.y) / 2,
    }
    const q2Point = {
      x: (p2.x + midpoint.x) / 2,
      y: (p2.y + midpoint.y) / 2,
    }

    const isCollidingObstacle = obstacles.some((o) => {
      if (o.obstacleType === "line") {
        const [op1, op2] = o.linePoints

        return getSegmentIntersection(
          q1Point.x,
          q1Point.y,
          q2Point.x,
          q2Point.y,
          op1.x,
          op1.y,
          op2.x,
          op2.y,
        )
      } else {
        // TODO
        return false
      }
    })

    const isCloseToObstacle = obstacles.some((o) => {
      if (o.obstacleType === "line") {
        const [op1, op2] = o.linePoints

        return (
          getDistanceToSegment(midpoint, {
            x1: op1.x,
            y1: op1.y,
            x2: op2.x,
            y2: op2.y,
          }) < 0.05
        )
      }
    })

    // Check if midpoint is close to any other fit point
    const tooCloseToOtherFitPoint = fitPoints.some(
      (p) => (midpoint.x - p.x) ** 2 + (midpoint.y - p.y) ** 2 < 0.02 ** 2,
    )

    if (
      !isCollidingObstacle &&
      !tooCloseToOtherFitPoint &&
      !isCloseToObstacle
    ) {
      fitPoints.push(midpoint)
      return true
    } else {
      return false
    }
  }

  for (let i = 0; i < costPoints.length; i++) {
    const p1 = costPoints[i]
    const costPointDistancesSq: [Point, number][] = []
    for (let j = i + 1; j < costPoints.length; j++) {
      const p2 = costPoints[j]
      costPointDistancesSq.push([p2, (p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2])
    }

    // Sort cost point distances by distance
    costPointDistancesSq.sort((a, b) => a[1] - b[1])

    // Add midpoints between 5 closest cost points
    let midPointsAdded = 0
    for (const [p2] of costPointDistancesSq) {
      if (attemptToAddMidpoint(p1, p2)) {
        midPointsAdded++
      }
      if (midPointsAdded >= 5) {
        break
      }
    }
  }

  // Add fit points between any cost point and (-0.5,0) and (0.5,0)
  for (let i = 0; i < costPoints.length; i++) {
    for (const tx of [-0.5, 0.5]) {
      const p1 = costPoints[i]
      const p2 = { x: tx, y: 0 }
      attemptToAddMidpoint(p1, p2)
    }
  }

  fitPoints.push({ x: -0.5, y: 0, color: "green" })
  fitPoints.push({ x: 0.5, y: 0, color: "green" })

  return fitPoints
}

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

const distance = (p1: Point, p2: Point): number => {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2))
}

const CollisionTester = ({
  scenario,
  solver,
  optimizationMethod,
}: {
  scenario: Omit<Scenario, "fn">
  solver: Solver
  optimizationMethod: "gradientDescent" | "svd"
}) => {
  const [done, setDone] = useState(false)
  const costPoints: (Point & { cost: number })[] = useMemo(
    () => [
      { x: 0, y: 0, cost: 1, color: "purple" },
      {
        x: 0,
        y: -0.5,
        cost: 1,
        color: "purple",
      },
      {
        x: 0,
        y: 0.5,
        cost: 1,
        color: "purple",
      },
    ],
    [],
  )
  const t = useT({ stepTime: 100 })

  // Trim old cost points (TODO: might want to reduce cost randomly to avoid sudden switches, remove things with <0 cost)
  // trimming old cost points really only works w/ gradient descent models where the line
  // has started to avoid the old cost points
  // if (costPoints.length > 100) {
  //   costPoints.splice(0, 100 - costPoints.length)
  // }

  const intersections = solver
    .computeIntersectionsWithSegments(
      scenario.obstacles.flatMap((o) => {
        if (o.obstacleType === "line") {
          return o.linePoints.slice(0, -1).map((p, i) => ({
            x1: p.x,
            x2: o.linePoints[i + 1].x,
            y1: p.y,
            y2: o.linePoints[i + 1].y,
          }))
        } else {
          // TODO
          return []
        }
      }),
    )
    .map((p) => ({ x: p.x, y: p.y, cost: 1, slope: p.slope, color: "purple" }))

  const goesThroughTargets =
    Math.abs(solver.evaluate(-0.5)) < 0.01 &&
    Math.abs(solver.evaluate(0.5)) < 0.01

  const complete = intersections.length === 0 && goesThroughTargets

  if (complete && !done) {
    setDone(true)
  }

  let fitPoints: Point[] = []
  // TODO only use for SVD
  fitPoints = computeFitPoints2(costPoints, scenario.obstacles)

  if (!complete) {
    for (const intersection of intersections) {
      let tooClose = false
      for (const costPoint of costPoints) {
        if (distance(intersection, costPoint) < 0.005) {
          tooClose = true
          break
        }
      }
      if (!tooClose) {
        costPoints.push(intersection)
      }
    }

    if (!solver.W.some((w) => Number.isNaN(w))) {
      if (optimizationMethod === "gradientDescent" || costPoints.length < 10) {
        solver.computeWeightsUsingGradientDescent({
          costPoints: costPoints.slice(-400),
          fitPoints,
          epochs: 100,
          learningRate: 0.0001,
          l2Lambda: 0.01,
          outOfBoundsCost: 10,
          degreeDecayFactor: 1,
          targetWeight: 10,
        })
      }
    }
  }

  const fn = (x: number) => solver.evaluate(x)

  return (
    <div>
      <div>
        t: {t}, W: [{solver.W.map((a) => a.toFixed(4)).join(", ")}]
      </div>
      <Visualization
        {...scenario}
        points={scenario.points.concat(costPoints).concat(fitPoints)}
        fn={fn}
      />
    </div>
  )
}

export const GradDeg5 = () => {
  const solver = useMemo(() => {
    const solver = new PolynomialSegmentSolver(5)
    // create asymmetric initial condition
    solver.W[0] = 0.01
    solver.W[1] = 0.001
    return solver
  }, [])
  return (
    <CollisionTester
      solver={solver}
      optimizationMethod="gradientDescent"
      scenario={{
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
        ],
      }}
    />
  )
}
