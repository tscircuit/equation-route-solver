import { useMemo } from "react"
import { PolynomialLine } from "../polynomial-line"
import type { Scenario } from "../types"
import { generateRandomTestData } from "../util/generate-random-test-data"
import useT from "./fixtures/use-t"
import { Visualization } from "./fixtures/Visualization"

const scenario: Scenario = {
  points: [],
  fn: (x) => 0,
  obstacles: [
    {
      obstacleType: "line",
      linePoints: [
        { x: 0.5, y: -0.3 },
        { x: 0.5, y: 0.3 },
      ],
      width: 0.01,
    },
  ],
}

export const Collision1 = () => {
  const line = useMemo(() => new PolynomialLine(20), [])

  const t = useT({ stepTime: 100 })

  line.computeWeightsaUsingGradientDescent({
    costPoints: [
      { x: 0.5, y: 0, cost: 1 },
      { x: 0.5, y: -0.1, cost: 1 },
      { x: 0.5, y: -0.2, cost: 1 },
      { x: 0.5, y: -0.3, cost: 1 },
      { x: 0.5, y: 0.1, cost: 1 },
      { x: 0.5, y: 0.2, cost: 1 },
    ],
    epochs: 10,
    learningRate: 0.1,
    l2Lambda: 0.1,
    outOfBoundsCost: 1,
    degreeDecayFactor: 0.9,
    targetWeight: 10,
  })

  const fn = (x: number) => line.evaluate(x)

  return (
    <div>
      <div>
        t: {t}, W: [{line.W.join(", ")}]
      </div>
      <Visualization {...scenario} fn={fn} />
    </div>
  )
}
