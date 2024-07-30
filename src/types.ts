export interface Point {
  x: number
  y: number
  color?: string
  cost?: number
  slope?: number
}
export type DrawFunction = (x: number) => number
export type Obstacle =
  | { obstacleType: "polygon"; points: Point[] }
  | { obstacleType: "line"; linePoints: Point[]; width: number }

export type Scenario = {
  points: Point[]
  fn: DrawFunction
  obstacles: Obstacle[]
}
