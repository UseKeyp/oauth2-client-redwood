import React from 'react'
import { useSpring, animated } from 'react-spring'

// <AnimationLoop reset native config={{ duration: 2000 }}>

const LoadingDots = () => {
  const items = new Array(3).fill(null)

  const { values } = useSpring({
    from: { values: 0 },
    to: { values: 2 * Math.PI },
    loop: true,
    config: {
      duration: 2000,
    },
    keys: items,
  })
  return (
    <div className="loading-dots">
      {items.map((item, i) => (
        <animated.div
          className="loading-dots__dot"
          key={i}
          style={{
            transform: values.to(
              (r) =>
                `translate3d(0, ${
                  2 * Math.sin(r + (i * 2 * Math.PI) / 5)
                }px, 0)`
            ),
          }}
        />
      ))}
    </div>
  )
}

export default LoadingDots
