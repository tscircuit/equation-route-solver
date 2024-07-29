import type { Scenario } from "../types"
import { generateRandomTestData } from "../util/generate-random-test-data"
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

export const Collision1 = () => <Visualization {...scenario} />
