import { useMemo } from "react"
import { PolynomialLine } from "../polynomial-line"
import type { Point, Scenario } from "../types"
import { generateRandomTestData } from "../util/generate-random-test-data"
import useT from "./fixtures/use-t"
import { Visualization } from "./fixtures/Visualization"

// const scenario: Scenario = {
//   points: [
//     {
//       x: -0.5,
//       y: 0,
//       color: "green",
//     },
//     {
//       x: 0.5,
//       y: 0,
//       color: "green",
//     },
//   ],
//   fn: (x) => 0,
//   obstacles: [
//     {
//       obstacleType: "line",
//       linePoints: [
//         { x: 0, y: -0.8 },
//         { x: 0, y: 0.3 },
//       ],
//       width: 0.01,
//     },
//     {
//       obstacleType: "line",
//       linePoints: [
//         { x: -0.2, y: 0.5 },
//         { x: -0.1, y: 0.3 },
//       ],
//       width: 0.01,
//     },
//     {
//       obstacleType: "line",
//       linePoints: [
//         { x: 0.2, y: 0.1 },
//         { x: 0.3, y: 0.3 },
//       ],
//       width: 0.01,
//     },
//   ],
// }

const CollisionTester = ({
  scenario,
  solver,
}: { scenario: Omit<Scenario, "fn">; solver: PolynomialLine }) => {
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
    .map((p) => ({ x: p.x, y: p.y, cost: 1, color: "purple" }))

  costPoints.push(...intersections)

  solver.computeWeightsaUsingGradientDescent({
    costPoints,
    epochs: 10,
    learningRate: 0.1,
    l2Lambda: 0.01,
    outOfBoundsCost: 100,
    degreeDecayFactor: 1,
    targetWeight: 10,
  })

  const fn = (x: number) => solver.evaluate(x)

  return (
    <div>
      <div>
        t: {t}, W: [{solver.W.map((a) => a.toFixed(4)).join(", ")}]
      </div>
      <Visualization
        {...scenario}
        points={scenario.points.concat(costPoints)}
        fn={fn}
      />
    </div>
  )
}

export const Collision1 = () => {
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
      scenario={{
        points: [
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
        ],
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
        ],
      }}
    />
  )
}

export const Collision2 = () => {
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
      scenario={{
        points: [
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
        ],
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
              { x: 0.2, y: 0.1 },
              { x: 0.3, y: 0.3 },
            ],
            width: 0.01,
          },
        ],
      }}
    />
  )
}
