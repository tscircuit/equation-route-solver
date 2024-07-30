import { Solver } from "./solver"

export class PolynomialSegmentSolver extends Solver {
  public fitWx: number[]
  constructor(degreeOrW: number[] | number) {
    super(degreeOrW)
    this.fitWx = new Array(this.degree + 1)
      .fill(0)
      .map((_, i) => i / this.degree - 0.5)
  }
  evaluate(x: number): number {
    const k = 0.01
    return this.fitWx.reduce(
      (sum, fx, i) => sum + this.W[i] * (k / ((x - fx) ** 2 + k)),
    )
  }
}
