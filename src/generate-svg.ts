import type { Point, DrawFunction, Obstacle, Line } from "./types"
import type { Matrix } from "transformation-matrix"
import { applyToPoint } from "transformation-matrix"

export function generateSVG({
  points,
  fn,
  obstacles,
  lines,
  transform,
}: {
  points?: Point[]
  fn?: DrawFunction
  obstacles?: Obstacle[]
  lines?: Line[]
  transform: Matrix
}): string {
  function drawPoints(points: Point[]): string {
    return points
      .map((point) => {
        const transformedPoint = applyToPoint(transform, {
          x: point.x,
          y: point.y,
        })
        return `
      <circle 
        cx="${transformedPoint.x}" 
        cy="${transformedPoint.y}" 
        r="${0.004 * transform.a}" 
        fill-opacity="0.8"
        fill="${point.color}"
      />`
      })
      .join("")
  }

  function drawFunction(fn: DrawFunction): string {
    const numPoints = 100
    const points = Array.from({ length: numPoints }, (_, i) => {
      const x = i / (numPoints - 1) - 0.5
      const y = fn(x)
      const transformedPoint = applyToPoint(transform, { x, y: y })
      return `${transformedPoint.x},${transformedPoint.y}`
    })
    return `<polyline points="${points.join(" ")}" fill="none" stroke="black" stroke-width="${0.005 * transform.a}" />`
  }

  function drawObstacles(obstacles: Obstacle[]): string {
    return obstacles
      .map((obstacle) => {
        switch (obstacle.obstacleType) {
          case "polygon": {
            const points = obstacle.points
              .map((p) => {
                const transformedPoint = applyToPoint(transform, {
                  x: p.x,
                  y: p.y,
                })
                return `${transformedPoint.x},${transformedPoint.y}`
              })
              .join(" ")
            return `<polygon points="${points}" stroke="red" fill="rgba(255,0,0,0.2)"  stroke-width="${0.005 * transform.a}" />`
          }
          case "line": {
            const [start, end] = obstacle.linePoints
            const transformedStart = applyToPoint(transform, {
              x: start.x,
              y: start.y,
            })
            const transformedEnd = applyToPoint(transform, {
              x: end.x,
              y: end.y,
            })
            return `
            <line 
              x1="${transformedStart.x}" 
              y1="${transformedStart.y}" 
              x2="${transformedEnd.x}" 
              y2="${transformedEnd.y}" 
              stroke="red" 
              stroke-width="${obstacle.width * transform.a}"
            />`
          }
        }
      })
      .join("")
  }

  function drawLines(lines: Line[]): string {
    return lines
      .map((line) => {
        const transformedPoints = line.points.map((point: any) =>
          applyToPoint(transform, { x: point.x, y: point.y }),
        )
        const pointsString = transformedPoints
          .map((p) => `${p.x},${p.y}`)
          .join(" ")
        return `
        <polyline 
          points="${pointsString}" 
          fill="none" 
          stroke="${line.color ?? "blue"}" 
          stroke-width="${0.005 * transform.a}"
        />`
      })
      .join("")
  }

  const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      ${fn && drawFunction(fn)}
      ${obstacles && drawObstacles(obstacles)}
      ${lines && drawLines(lines)}
      ${points && drawPoints(points)}
    </svg>
  `

  return svgContent
}

export default generateSVG
