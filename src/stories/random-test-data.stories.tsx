import { generateRandomTestData } from "../util/generate-random-test-data"
import { Visualization } from "./fixtures/Visualization"

export const Test = () => (
  <div style={{ width: "100vw", height: "100vh" }}>
    <Visualization {...generateRandomTestData(10, 5, 5)} />
  </div>
)
