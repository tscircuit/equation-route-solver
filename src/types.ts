export interface Point {
  x: number
  y: number
  color?: string
  cost?: number
  slope?: number
  nodeName?: string
}
export type LineObstacle = {
  obstacleType: "line"
  linePoints: Point[]
  width: number
}
export type Obstacle =
  | { obstacleType: "polygon"; points: Point[] }
  | LineObstacle

export type Line = {
  points: Point[]
  color?: string
}

export type Scenario = {
  points: Point[]
  fn: DrawFunction
  obstacles: Obstacle[]
  lines?: Line[]
}

export type DrawFunction = (x: number) => number
