import { useState, useEffect } from "react"

const useT = ({ stepTime = 1000 }) => {
  const [t, setT] = useState(0)

  useEffect(() => {
    const intervalId = setInterval(() => {
      setT((prevT) => prevT + 1)
    }, stepTime)

    return () => clearInterval(intervalId)
  }, [stepTime])

  return t
}

export default useT
