import { useMemo } from "react"
import { PolynomialLine } from "../polynomial-line"
import type { Point, Scenario } from "../types"
import { generateRandomTestData } from "../util/generate-random-test-data"
import useT from "./fixtures/use-t"
import { Visualization } from "./fixtures/Visualization"

const scenario: Scenario = {
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
  fn: (x) => 0,
  obstacles: [
    {
      obstacleType: "line",
      linePoints: [
        { x: 0, y: -0.3 },
        { x: 0, y: 0.3 },
      ],
      width: 0.01,
    },
  ],
}

export const Collision1 = () => {
  const line = useMemo(() => {
    const line = new PolynomialLine(3)
    // create asymmetric initial condition
    line.W[0] = 0.1
    line.W[1] = -0.05
    return line
  }, [])
  const costPoints: (Point & { cost: number })[] = useMemo(
    () => [{ x: 0, y: 0, cost: 1 }],
    [],
  )
  const t = useT({ stepTime: 1000 })

  // Trim old cost points (TODO: might want to reduce cost randomly to avoid sudden switches, remove things with <0 cost)
  // if (costPoints.length > 100) {
  //   costPoints.splice(0, 100 - costPoints.length)
  // }

  const intersections = line
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

  line.computeWeightsaUsingGradientDescent({
    costPoints,
    epochs: 10,
    learningRate: 0.1,
    l2Lambda: 0.01,
    outOfBoundsCost: 100,
    degreeDecayFactor: 1,
    targetWeight: 10,
  })

  const fn = (x: number) => line.evaluate(x)

  return (
    <div>
      <div>
        t: {t}, W: [{line.W.map((a) => a.toFixed(4)).join(", ")}]
      </div>
      <Visualization
        {...scenario}
        points={scenario.points.concat(costPoints)}
        fn={fn}
      />
    </div>
  )
}
