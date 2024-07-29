import type { Point } from "transformation-matrix"

/**
 * Represents a polynomial line of degree N, a polynomial line is given by...
 *
 * y = W0 + W1x + W2x^2 + ... + Wnx^n
 *
 */
export class PolynomialLine {
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
   * Note that the line should always intersect (x=-0.5, y=0) and (x=0.5, y=0), these
   * are the target points
   *
   */
  computeWeightsaUsingGradientDescent({
    costPoints,
    epochs = 1000,
    learningRate = 0.01,
    l2Lambda = 0.1,
    targetWeight = 1,
    outOfBoundsCost = 0.1,
    degreeDecayFactor = 0.5,
  }: {
    costPoints: Array<{ x: number; y: number; cost: number }>
    epochs: number
    learningRate?: number
    l2Lambda?: number
    targetWeight?: number
    outOfBoundsCost?: number
    degreeDecayFactor?: number
  }): void {
    for (let epoch = 0; epoch < epochs; epoch++) {
      let gradients = new Array(this.W.length).fill(0)

      // Calculate gradients for cost points
      for (const point of costPoints) {
        const y = this.evaluate(point.x)
        const dist = y - point.y

        // We want the line to be encourage to go away from the cost point, so
        // we as dist goes up, we want the impact on the gradient to go down
        const gradientFactor = Math.min(1 / dist ** 2, 1)

        for (let i = 0; i < this.W.length; i++) {
          gradients[i] -=
            Math.sign(dist) * gradientFactor * Math.pow(point.x, i) * point.cost
        }
      }

      // Calculate gradients for target points (-0.5,0) and (0.5,0)
      const yMinus05 = this.evaluate(-0.5)
      const y05 = this.evaluate(0.5)
      for (let i = 0; i < this.W.length; i++) {
        gradients[i] += 2 * yMinus05 * Math.pow(-0.5, i) * targetWeight
        gradients[i] += 2 * y05 * Math.pow(0.5, i) * targetWeight
      }

      // Penalize large values of y (nothing is allowed to go above 1 or below -1)
      const Q1 = 10
      for (let x = -0.5; x <= 0.5; x += 1 / Q1) {
        const y = this.evaluate(x)
        const cost = (y ** 2 * outOfBoundsCost) / Q1
        for (let i = 0; i < this.W.length; i++) {
          gradients[i] += 2 * Math.sign(y) * Math.pow(x, i) * cost
        }
      }

      // Update weights with degree-dependent learning rate
      for (let i = 0; i < this.W.length; i++) {
        const degreeLearningRate = learningRate * Math.pow(degreeDecayFactor, i)
        gradients[i] *= degreeLearningRate
      }

      // L2 regularization
      for (let i = 0; i < this.W.length; i++) {
        gradients[i] += 2 * l2Lambda * this.W[i]
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
