import type { Point } from "transformation-matrix"

/**
 * Represents a polynomial line of degree N, a polynomial line is given by...
 *
 * y = W0 + W1x + W2x^2 + ... + Wnx^n
 *
 */
class PolynomialLine {
  public W: number[]
  public degree: number

  constructor(degreeOrW: number[] | number) {
    if (Array.isArray(degreeOrW)) {
      this.W = degreeOrW
      this.degree = degreeOrW.length - 1
    } else {
      this.W = new Array(degreeOrW + 1).fill(0)
      this.degree = degreeOrW
    }
  }

  /**
   * Solve for the weights given the cost points (points to avoid)
   *
   * Note that the line should always intersect (x=0, y=0) and (x=1, y=0), these
   * are the target points
   *
   */
  computeWeightsaUsingGradientDescent({
    costPoints,
    epochs = 1000,
    learningRate = 0.01,
  }: {
    costPoints: Array<{ x: number; y: number; cost: number }>
    epochs: number
    learningRate: number
  }): void {
    for (let epoch = 0; epoch < epochs; epoch++) {
      let gradients = new Array(this.W.length).fill(0)

      // Calculate gradients for cost points
      for (const point of costPoints) {
        const y = this.evaluate(point.x)
        const error = y - point.y
        for (let i = 0; i < this.W.length; i++) {
          gradients[i] += 2 * error * Math.pow(point.x, i) * point.cost
        }
      }

      // Calculate gradients for target points (0,0) and (1,0)
      const y0 = this.evaluate(0)
      const y1 = this.evaluate(1)
      for (let i = 0; i < this.W.length; i++) {
        gradients[i] += 2 * y0 * Math.pow(0, i)
        gradients[i] += 2 * y1 * Math.pow(1, i)
      }

      // Update weights
      for (let i = 0; i < this.W.length; i++) {
        this.W[i] -= learningRate * gradients[i]
      }
    }
  }

  computeIntersectionsWithObstacles(
    obstacles: Array<{ x1: number; x2: number; y1: number; y2: number }>,
  ): Point[] {
    const intersections: Point[] = []

    // TODO compute intersections

    return intersections
  }

  increaseDegree(): void {
    this.degree += 1
    this.W.push(0)
  }

  /**
   * Evaluate the polynomial at a given x value
   */
  evaluate(x: number): number {
    return this.W.reduce((sum, w, i) => sum + w * Math.pow(x, i), 0)
  }
}
