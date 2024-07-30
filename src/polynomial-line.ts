import { Solver } from "./solver"
import type { Point } from "./types"
import { getLineIntersection } from "./util/get-line-intersection"
import { SVD } from "svd-js"

/**
 * Represents a polynomial line of degree N, a polynomial line is given by...
 *
 * y = W0 + W1x + W2x^2 + ... + Wnx^n
 *
 */
export class PolynomialLine extends Solver {
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
