import generateSVG from "../../generate-svg"
import type { Scenario } from "../../types"
import { SuperGrid } from "react-supergrid"
import { useMouseMatrixTransform } from "use-mouse-matrix-transform"

export const Visualization = (props: Scenario) => {
  const { transform, ref } = useMouseMatrixTransform()
  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        width: "calc(100vw - 200px)",
        height: "100vh",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: "100%",
        }}
      >
        <SuperGrid
          transform={transform}
          width={ref.current?.clientWidth || 500}
          height={ref.current?.clientHeight || 500}
        />
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          height: 0,
          width: ref.current?.clientWidth || 500,
          height: ref.current?.clientHeight || 500,
        }}
        dangerouslySetInnerHTML={{
          __html: generateSVG({ ...props, transform }),
        }}
      />
    </div>
  )
}
