import type { Point, DrawFunction, Obstacle, Scenario } from "../types"

// Seeded random number generator
class SeededRandom {
  private m = 2 ** 35 - 31
  private a = 185852
  private s = 0

  constructor(seed: number) {
    this.s = seed % this.m
  }

  public next(): number {
    this.s = (this.a * this.s) % this.m
    return this.s / this.m
  }
}

// Test draw function (a simple sine wave)
const testDrawFunction: DrawFunction = (x: number) => {
  return 0.5 + 0.4 * Math.sin(x / 10)
}

// Function to generate random test data
export function generateRandomTestData(
  numPoints: number,
  numObstacles: number,
  seed: number = Date.now(),
): Scenario {
  const random = new SeededRandom(seed)

  const points: Point[] = Array.from({ length: numPoints }, () => ({
    x: random.next(),
    y: random.next(),
    color: `rgb(${Math.floor(random.next() * 256)}, ${Math.floor(random.next() * 256)}, ${Math.floor(random.next() * 256)})`,
  }))

  const fnParam = random.next()
  const fn: DrawFunction = (x: number) => {
    return 0.5 + 0.4 * Math.sin(x * fnParam * Math.PI * 2)
  }

  const obstacles: Obstacle[] = Array.from({ length: numObstacles }, () => {
    if (random.next() > 0.5) {
      return {
        obstacleType: "polygon" as const,
        points: Array.from(
          { length: Math.floor(random.next() * 3) + 3 },
          () => ({
            x: random.next(),
            y: random.next(),
          }),
        ),
      }
    }
    return {
      obstacleType: "line" as const,
      linePoints: [
        { x: random.next(), y: random.next() },
        { x: random.next(), y: random.next() },
      ],
      width: random.next() * 0.05,
    }
  })

  return { points, fn, obstacles }
}
