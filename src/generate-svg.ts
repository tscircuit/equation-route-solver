import type { Point, DrawFunction, Obstacle } from "./types"
import type { Matrix } from "transformation-matrix"

export function generateSVG({
  points,
  fn,
  obstacles,
  transform,
}: {
  points: Point[]
  fn: DrawFunction
  obstacles: Obstacle[]
  transform: Matrix
}): string {
  const margin = 0.1
  const viewBoxSize = 1 + 2 * margin
  const viewBox = `${-margin} ${-margin} ${viewBoxSize} ${viewBoxSize}`

  function drawPoints(points: Point[]): string {
    return points
      .map(
        (point) => `
      <circle 
        cx="${point.x}" 
        cy="${1 - point.y}" 
        r="0.005" 
        fill="${point.color}"
      />`,
      )
      .join("")
  }

  function drawFunction(fn: DrawFunction): string {
    const numPoints = 100
    const points = Array.from({ length: numPoints }, (_, i) => {
      const x = i / (numPoints - 1)
      const y = fn(x)
      return `${x},${1 - y}`
    })
    return `<polyline points="${points.join(" ")}" fill="none" stroke="black" stroke-width="0.005" />`
  }

  function drawObstacles(obstacles: Obstacle[]): string {
    return obstacles
      .map((obstacle) => {
        switch (obstacle.obstacleType) {
          case "polygon": {
            const points = obstacle.points
              .map((p) => `${p.x},${1 - p.y}`)
              .join(" ")
            return `<polygon points="${points}" stroke="red" fill="rgba(255,0,0,0.2)"  stroke-width="0.005" />`
          }
          case "line": {
            const [start, end] = obstacle.linePoints
            return `
            <line 
              x1="${start.x}" 
              y1="${1 - start.y}" 
              x2="${end.x}" 
              y2="${1 - end.y}" 
              stroke="red" 
              stroke-width="${obstacle.width}"
            />`
          }
        }
      })
      .join("")
  }

  const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="100%" height="100%">
      ${drawFunction(fn)}
      ${drawObstacles(obstacles)}
      ${drawPoints(points)}
    </svg>
  `

  return svgContent
}

export default generateSVG
