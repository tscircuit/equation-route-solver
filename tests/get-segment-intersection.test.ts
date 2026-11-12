import assert from "node:assert/strict"
import { test } from "node:test"
import { getSegmentIntersection } from "../src/util/get-segment-intersection.ts"

// Run with Node 24: node --test tests/get-segment-intersection.test.ts
type Segment = [number, number, number, number]
type Point = [number, number]
type Fixture = [string, Segment, Segment, Point | "overlap" | null]

const fixtures: Fixture[] = [
  ["rejects parallel horizontal segments", [0,0,4,0], [1,1,3,1], null],
  ["rejects parallel vertical segments", [0,0,0,4], [1,1,1,3], null],
  ["rejects distinct positive-slope lines", [0,0,4,8], [0,1,4,9], null],
  ["rejects distinct negative-slope lines", [0,4,4,0], [0,6,4,2], null],
  ["returns a point in horizontal overlap", [2,5,6,5], [4,5,8,5], "overlap"],
  ["returns a point in vertical overlap", [5,2,5,6], [5,4,5,8], "overlap"],
  ["returns a point in positive-slope overlap", [2,5,6,13], [4,9,8,17], "overlap"],
  ["returns a point in negative-slope overlap", [2,5,6,-3], [4,1,8,-7], "overlap"],
  ["handles contained collinear segments", [1,3,9,3], [3,3,5,3], "overlap"],
  ["handles identical segments", [2,5,6,5], [2,5,6,5], "overlap"],
  ["rejects separated horizontal segments", [0,0,1,0], [2,0,3,0], null],
  ["rejects separated vertical segments", [2,0,2,1], [2,2,2,3], null],
  ["rejects separated sloping segments", [0,0,1,2], [2,4,3,6], null],
  ["handles a point inside a horizontal segment", [3,5,3,5], [1,5,5,5], [3,5]],
  ["handles a point inside a vertical segment", [5,3,5,3], [5,1,5,5], [5,3]],
  ["handles a point inside a sloping segment", [3,7,3,7], [1,3,5,11], [3,7]],
  ["rejects a point off a segment's supporting line", [3,6,3,6], [1,5,5,5], null],
  ["rejects a point beyond a segment", [6,5,6,5], [1,5,5,5], null],
  ["handles coincident point segments", [3,5,3,5], [3,5,3,5], [3,5]],
  ["rejects distinct point segments", [3,5,3,5], [4,5,4,5], null],
  ["preserves an interior crossing", [0,0,4,4], [0,4,4,0], [2,2]],
  ["preserves a nonparallel endpoint touch", [0,0,2,2], [2,2,3,0], [2,2]],
  ["preserves a collinear endpoint touch", [2,5,6,5], [6,5,8,5], [6,5]],
  ["rejects intersections outside finite segments", [0,0,1,1], [2,0,2,4], null],
  ["preserves a fractional intersection", [0,0,1,1], [0,1,1,0], [0.5,0.5]],
  ["rejects almost parallel separated lines", [0,0,4,0], [0,1,4,1.000001], null],
]

const reverse = ([x1, y1, x2, y2]: Segment): Segment => [x2, y2, x1, y1]

function assertOnSegment(point: Point, segment: Segment) {
  const [x, y] = point
  const [x1, y1, x2, y2] = segment
  assert.ok(Number.isFinite(x) && Number.isFinite(y))
  // Independent membership oracle: equality in the triangle inequality.
  const viaPoint = Math.hypot(x - x1, y - y1) + Math.hypot(x - x2, y - y2)
  const length = Math.hypot(x2 - x1, y2 - y1)
  assert.ok(Math.abs(viaPoint - length) < 1e-10)
}

for (const [name, first, second, expected] of fixtures) {
  test(name, () => {
    // Segment order and endpoint direction must not change intersection existence.
    // An overlap has many valid answers, so do not require one arbitrary endpoint.
    for (const a of [first, reverse(first)]) {
      for (const b of [second, reverse(second)]) {
        for (const [left, right] of [[a, b], [b, a]]) {
          const actual = getSegmentIntersection(...left, ...right)
          if (expected === null) {
            assert.equal(actual, null)
          } else {
            assert.ok(actual)
            if (expected !== "overlap") assert.deepEqual(actual, expected)
            assertOnSegment(actual, first)
            assertOnSegment(actual, second)
          }
        }
      }
    }
  })
}
