'use client'

import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function NoobMeter({
  initialValue = 5,
  size = 'medium',
  onValueChange
}: {
  initialValue?: number
  autoAnimate?: boolean
  size?: 'small' | 'medium' | 'large'
  onValueChange?: (value: number) => void
}) {
  const [value, setValue] = useState(initialValue)
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    const handleError = (e: ErrorEvent) => {
      if (e.message && e.message.includes('Failed to load')) {
        console.warn('Resource loading error in NoobMeter:', e.message)
        e.preventDefault()
      }
    }

    window.addEventListener('error', handleError as any)
    return () => window.removeEventListener('error', handleError as any)
  }, [])

  const meterColorRgb = '0, 230, 255'

  useEffect(() => {
    const interval = setInterval(() => {
      const newValue = Math.round(Math.random() * 100) / 10
      setValue(newValue)
      if (onValueChange) onValueChange(newValue)
    }, 3000)

    return () => clearInterval(interval)
  }, [onValueChange])

  const getLevel = (val: number) => {
    if (val <= 2) return 'Noob Pro Max'
    if (val <= 4) return 'Noob'
    if (val <= 6) return 'Average Coder'
    if (val <= 8) return 'Pro'
    return '10x'
  }

  const getNeedleRotation = (val: number) => {
    return (val / 10) * 360
  }
  const theme = useTheme()

  const getDarkerColor = (color: string) => {
    if (theme?.theme !== 'dark') {
      return color.replace(/rgba?\(([^)]+)\)/, (_, colorParts) => {
        const [r, g, b] = colorParts.split(',').map(Number)
        const darker = (x: number) => Math.max(0, x - 60)
        return `rgba(${darker(r)}, ${darker(g)}, ${darker(b)}, 1)`
      })
    }
    return color
  }

  const getLevelColor = (val: number) => {
    if (val <= 2) return getDarkerColor('rgba(255, 79, 79, 1)')
    if (val <= 4) return getDarkerColor('rgba(255, 159, 67, 1)')
    if (val <= 6) return getDarkerColor('rgba(255, 187, 51, 1)')
    if (val <= 8) return getDarkerColor('rgba(80, 205, 137, 1)')
    return getDarkerColor('rgba(0, 230, 255, 1)')
  }

  const getLevelGlowColor = (val: number) => {
    if (val <= 2) return getDarkerColor('rgba(255, 79, 79, 0.5)')
    if (val <= 4) return getDarkerColor('rgba(255, 159, 67, 0.5)')
    if (val <= 6) return getDarkerColor('rgba(255, 187, 51, 0.5)')
    if (val <= 8) return getDarkerColor('rgba(80, 205, 137, 0.5)')
    return getDarkerColor(`rgba(${meterColorRgb}, 0.5)`)
  }

  const getSizeClass = () => {
    switch (size) {
      case 'small':
        return 'h-[150px] w-[150px]'
      case 'large':
        return 'h-[300px] w-[300px]'
      default:
        return 'h-[220px] w-[220px]'
    }
  }

  return (
    <div className="relative mx-auto flex w-full max-w-xs flex-col items-center justify-center">
      <motion.div
        className={`relative mx-auto aspect-square ${getSizeClass()} bg-card/50 border-primary/30 overflow-hidden rounded-full border p-2 shadow-[0_0_15px_rgba(0,230,255,0.3)] backdrop-blur-md`}
        onHoverStart={() => setIsHovering(true)}
        onHoverEnd={() => setIsHovering(false)}
        whileHover={{
          scale: 1.05,
          boxShadow: '0 0 25px rgba(0, 230, 255, 0.5)'
        }}
        transition={{ duration: 0.3 }}
      >
        <div className="from-primary/5 to-secondary/5 absolute inset-0 rounded-full bg-gradient-to-br via-transparent"></div>
        <div className="absolute top-0 left-0 h-full w-full">
          <svg
            viewBox="0 0 200 200"
            className="h-full w-full"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <radialGradient
                id="gaugeGlow"
                cx="50%"
                cy="50%"
                r="50%"
                fx="50%"
                fy="50%"
              >
                <stop offset="0%" stopColor="rgba(0,230,255,0.15)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0)" />
              </radialGradient>
            </defs>
            <circle cx="100" cy="100" r="90" fill="url(#gaugeGlow)" />

            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="rgba(0,230,255,0.2)"
              strokeWidth="6"
            />

            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke={getLevelColor(value)}
              strokeWidth="6"
              strokeDasharray={`${(value / 10) * 502.4} 502.4`}
              strokeDashoffset="0"
              strokeLinecap="round"
              className="drop-shadow-[0_0_5px_rgba(0,230,255,0.9)]"
              transform="rotate(-90 100 100)"
            />

            {[0, 2, 4, 6, 8, 10].map((level, i) => {
              const angle = (level / 10) * 2 * Math.PI - Math.PI / 2
              const x1 = 100 + 90 * Math.cos(angle)
              const y1 = 100 + 90 * Math.sin(angle)
              const x2 = 100 + 80 * Math.cos(angle)
              const y2 = 100 + 80 * Math.sin(angle)

              return (
                <g key={level}>
                  <motion.line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="rgba(0,230,255,0.8)"
                    strokeWidth="2"
                    className="drop-shadow-[0_0_3px_rgba(0,230,255,0.9)]"
                    animate={
                      isHovering
                        ? {
                            strokeWidth: [2, 3, 2],
                            opacity: [0.8, 1, 0.8]
                          }
                        : {}
                    }
                    transition={{
                      duration: 1.5,
                      repeat: Number.POSITIVE_INFINITY,
                      delay: i * 0.2
                    }}
                  />
                  <text
                    x={100 + 65 * Math.cos(angle)}
                    y={100 + 65 * Math.sin(angle)}
                    fill="rgba(0,230,255,0.9)"
                    fontSize="10"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="drop-shadow-[0_0_3px_rgba(0,230,255,0.9)]"
                  >
                    {level}
                  </text>
                </g>
              )
            })}

            {Array.from({ length: 41 }).map((_, i) => {
              if (i % 4 === 0) return null
              const angle = (i / 40) * 2 * Math.PI - Math.PI / 2
              const x1 = 100 + 85 * Math.cos(angle)
              const y1 = 100 + 85 * Math.sin(angle)
              const x2 = 100 + 80 * Math.cos(angle)
              const y2 = 100 + 80 * Math.sin(angle)
              return (
                <motion.line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="rgba(0,230,255,0.4)"
                  strokeWidth="1"
                  animate={
                    isHovering
                      ? {
                          opacity: [0.4, 0.7, 0.4]
                        }
                      : {}
                  }
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: i * 0.05
                  }}
                />
              )
            })}

            <g
              style={{
                transform: `rotate(${getNeedleRotation(value)}deg)`,
                transformOrigin: '100px 100px',
                transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <line
                x1="100"
                y1="100"
                x2="100"
                y2="30"
                stroke={getLevelColor(value)}
                strokeWidth="2"
                className="drop-shadow-[0_0_5px_rgba(0,230,255,0.9)]"
              />
              <circle
                cx="100"
                cy="100"
                r="6"
                fill={getLevelColor(value)}
                className="drop-shadow-[0_0_8px_rgba(0,230,255,0.9)]"
              />
            </g>
          </svg>
        </div>
      </motion.div>
      s{' '}
      <motion.div
        className="mt-4 flex flex-col items-center"
        animate={isHovering ? { y: [0, -3, 0] } : {}}
        transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
      >
        <div
          className="border-opacity-30 mb-1 rounded-lg border px-4 py-1.5 text-center text-sm font-bold backdrop-blur-sm"
          style={{
            backgroundColor: `${getLevelColor(value)}20`,
            borderColor: getLevelColor(value),
            color: getLevelColor(value),
            boxShadow: `0 0 10px ${getLevelGlowColor(value)}`
          }}
        >
          {Number(value).toFixed(1)}
        </div>
        <motion.div
          key={getLevel(value)}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="text-center text-xs font-bold tracking-wider"
          style={{
            color: getLevelColor(value),
            textShadow: `0 0 5px ${getLevelGlowColor(value)}`
          }}
        >
          {getLevel(value)}
        </motion.div>
      </motion.div>
    </div>
  )
}
