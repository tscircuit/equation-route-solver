import { useMemo } from "react"
import { PolynomialLine } from "../polynomial-line"
import type { Point, Scenario } from "../types"
import { generateRandomTestData } from "../util/generate-random-test-data"
import useT from "./fixtures/use-t"
import { Visualization } from "./fixtures/Visualization"

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
  solver: PolynomialLine
  optimizationMethod: "gradientDescent" | "svd"
}) => {
  const costPoints: (Point & { cost: number })[] = useMemo(
    () => [{ x: 0, y: 0, cost: 1 }],
    [],
  )
  const t = useT({ stepTime: 100 })

  // Trim old cost points (TODO: might want to reduce cost randomly to avoid sudden switches, remove things with <0 cost)
  // trimming old cost points really only works w/ gradient descent models where the line
  // has started to avoid the old cost points
  if (costPoints.length > 100) {
    costPoints.splice(0, 100 - costPoints.length)
  }

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
  let fitPoints: Point[] = []

  if (!solver.W.some((w) => Number.isNaN(w))) {
    if (optimizationMethod === "gradientDescent" || costPoints.length < 7) {
      solver.computeWeightsUsingGradientDescent({
        costPoints: costPoints.slice(0, 100),
        epochs: 100,
        learningRate: 0.05,
        l2Lambda: 0.01,
        outOfBoundsCost: 10,
        degreeDecayFactor: 1,
        targetWeight: 10,
      })
    } else if (optimizationMethod === "svd") {
      for (const costPoint of costPoints) {
        // To compute a fit point, we project in four directions from a cost
        // point until we're no longer colliding with any obstacles
        const m = costPoint.slope
        if (m !== undefined) {
          const angle = Math.atan(m) + Math.PI / 2
          const coneSize = Math.PI / 8
          for (let i = -coneSize / 2; i <= coneSize / 2; i += coneSize / 2) {
            fitPoints.push(
              {
                x: costPoint.x + 0.05 * Math.cos(angle + (i * Math.PI) / 2),
                y: costPoint.y + 0.05 * Math.sin(angle + (i * Math.PI) / 2),
                color: "orange",
              },
              {
                x: costPoint.x - 0.05 * Math.cos(angle + (i * Math.PI) / 2),
                y: costPoint.y - 0.05 * Math.sin(angle + (i * Math.PI) / 2),
                color: "orange",
              },
            )
          }
        }
      }
      solver.computeWeightsWithSvd(fitPoints)
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
    const solver = new PolynomialLine(5)
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

export const GradDeg20 = () => {
  const solver = useMemo(() => {
    const solver = new PolynomialLine(20)
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

export const SvdDeg6WithFitPoints = () => {
  const solver = useMemo(() => {
    const solver = new PolynomialLine(6)
    // create asymmetric initial condition
    solver.W[0] = 0.01
    solver.W[1] = 0.001
    return solver
  }, [])
  return (
    <CollisionTester
      solver={solver}
      optimizationMethod="svd"
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
