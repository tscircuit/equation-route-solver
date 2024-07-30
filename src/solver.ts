import type { Point } from "./types"
import { getLineIntersection } from "./util/get-line-intersection"
import { SVD } from "svd-js"

export class Solver {
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
   * Solve for the weights using Singular Value Decomposition (SVD)
   */
  computeWeightsWithSvd(fitPoints: Point[], k?: number): void {
    const X: number[][] = []
    const y: number[] = []

    // Add target points
    X.push([])
    X.push([])
    for (let i = 0; i <= this.degree; i++) {
      X[0].push(Math.pow(-0.5, i))
      X[1].push(Math.pow(0.5, i))
    }

    // Add cost points
    for (const point of fitPoints) {
      const row = [1]
      for (let i = 1; i <= this.degree; i++) {
        row.push(Math.pow(point.x, i))
      }
      X.push(row)
      y.push(point.y)
    }

    if (X.length < X[0].length) {
      return this.computeWeightsUsingGradientDescent({
        costPoints: fitPoints,
        epochs: 1,
        learningRate: 0.01,
      })
    }

    // Perform SVD
    const { u, v, q } = SVD(X)

    // Truncated SVD
    // Determine k if not provided
    if (k === undefined) {
      // You can implement a method to choose k, e.g., based on explained variance
      k = Math.min(X.length, X[0].length)
    }

    // Truncate to k components
    const uTrunc = u.map((row) => row.slice(0, k))
    const vTrunc = v.slice(0, k)
    const qTrunc = q.slice(0, k)

    // Compute truncated pseudo-inverse
    const qInv = qTrunc.map((val) => (val !== 0 ? 1 / val : 0))
    const vT = vTrunc[0].map((_, colIndex) =>
      vTrunc.map((row) => row[colIndex]),
    )

    const pseudoInverse = vT.map((row) =>
      row.map((_, i) =>
        row.reduce((sum, vVal, j) => sum + vVal * qInv[j] * uTrunc[i][j], 0),
      ),
    )

    // Compute weights
    this.W = pseudoInverse.map((row) =>
      row.reduce((sum, val, i) => sum + val * y[i], 0),
    )

    // // Compute pseudo-inverse
    // const qInv = q.map((val) => (val !== 0 ? 1 / val : 0))
    // const vT = v[0].map((_, colIndex) => v.map((row) => row[colIndex]))

    // const pseudoInverse = vT.map((row) =>
    //   row.map((_, i) =>
    //     row.reduce((sum, vVal, j) => sum + vVal * qInv[j] * u[i][j], 0),
    //   ),
    // )

    // // Compute weights
    // this.W = pseudoInverse.map((row) =>
    //   row.reduce((sum, val, i) => sum + val * y[i], 0),
    // )
  }

  /**
   * Solve for the weights given the cost points (points to avoid)
   *
   * Note that the line should always intersect (x=-0.5, y=0) and (x=0.5, y=0), these
   * are the target points
   *
   */
  computeWeightsUsingGradientDescent({
    costPoints,
    epochs = 1000,
    learningRate = 0.01,
    l2Lambda = 0.1,
    targetWeight = 1,
    outOfBoundsCost = 0.1,
    degreeDecayFactor = 0.5,
  }: {
    costPoints: Array<{ x: number; y: number; cost?: number }>
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
            Math.sign(dist) *
            gradientFactor *
            Math.pow(point.x, i) *
            (point.cost ?? 1)
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

  computeIntersectionsWithSegments(
    segments: Array<{ x1: number; x2: number; y1: number; y2: number }>,
  ): Point[] {
    const intersections: Point[] = []

    for (const segment of segments) {
      const result = getLineIntersection(
        this.evaluate.bind(this),
        segment.x1,
        segment.y1,
        segment.x2,
        segment.y2,
      )

      if (result !== null) {
        intersections.push(...result.map(([x, y, m]) => ({ x, y, slope: m })))
      }
    }

    return intersections
  }

  evaluate(x: number): number {
    return 0
  }
}
