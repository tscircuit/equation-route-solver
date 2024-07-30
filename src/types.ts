export interface Point {
  x: number
  y: number
  color?: string
  cost?: number
  slope?: number
}
export type LineObstacle = {
  obstacleType: "line"
  linePoints: Point[]
  width: number
}
export type Obstacle =
  | { obstacleType: "polygon"; points: Point[] }
  | LineObstacle

export type Scenario = {
  points: Point[]
  fn: DrawFunction
  obstacles: Obstacle[]
}

export type DrawFunction = (x: number) => number
