'use client'

import { motion } from 'framer-motion'
import { Award, BugIcon, Medal, Trophy } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { getDiceBearAvatar, getNoobTitle } from '../../utils/helper'

interface PodiumChartProps {
  data: Array<{
    authorEmail: string
    authorName?: string
    avatarUrl?: string
    commitCount: number
    avgScore: number
    bestScore: number
    worstScore: number
  }>
  barColors: string[]
}

export default function PodiumChart({ data, barColors }: PodiumChartProps) {
  const sortedData = [...data]
    .sort((a, b) => a.avgScore - b.avgScore)
    .slice(0, 5)
    .map((participant, index) => ({
      ...participant,
      position: index + 1
    }))

  const podiumOrder = [
    sortedData.find(p => p.position === 5),
    sortedData.find(p => p.position === 3),
    sortedData.find(p => p.position === 1),
    sortedData.find(p => p.position === 2),
    sortedData.find(p => p.position === 4)
  ].filter(Boolean) as ((typeof sortedData)[0] & { position: number })[]

  const [animationComplete, setAnimationComplete] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const animateSequentially = (index: number) => {
      if (index < podiumOrder.length) {
        setActiveIndex(index)
        timeoutId = setTimeout(() => {
          animateSequentially(index + 1)
        }, 400)
      } else {
        setAnimationComplete(true)
      }
    }

    timeoutId = setTimeout(() => {
      animateSequentially(0)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [podiumOrder.length])

  const getBarHeight = (position: number) => {
    switch (position) {
      case 1:
        return 300
      case 2:
        return 240
      case 3:
        return 200
      case 4:
        return 160
      case 5:
        return 120
      default:
        return 100
    }
  }

  const getBarColor = (position: number) => {
    const colorIndex = position - 1
    const color = barColors[colorIndex % barColors.length]

    const lighterColor = `${color}40`
    const darkerColor = color

    return {
      bg: lighterColor,
      border: darkerColor,
      shadow: `${color}80`,
      text: darkerColor,
      dark: darkerColor,
      light: lighterColor
    }
  }

  const generateBugPaths = (barHeight: number, barWidth: number) => {
    const paths = []
    const bugCount = 2

    const centerX = 0
    const spreadWidth = barWidth * 0.8
    const step = spreadWidth / (bugCount - 1)

    for (let i = 0; i < bugCount; i++) {
      const startX = centerX - spreadWidth / 2 + i * step
      const startY = barHeight + 10

      const path = {
        x: [
          startX,
          startX + (Math.random() * 30 - 15),
          startX + (Math.random() * 40 - 20),
          startX + (Math.random() * 30 - 15),
          startX + (Math.random() * 20 - 10)
        ],
        y: [
          startY,
          startY - barHeight * 0.2 - Math.random() * 30,
          startY - barHeight * 0.5 - Math.random() * 40,
          startY - barHeight * 0.7 - Math.random() * 50,
          startY - barHeight * 0.9 - Math.random() * 30
        ]
      }

      paths.push({
        path,
        delay: Math.random() * 5,
        duration: 10 + Math.random() * 15
      })
    }

    return paths
  }

  return (
    <div className="relative flex h-[500px] w-full items-end justify-center gap-6 p-4">
      {podiumOrder.map((participant, index) => {
        const barHeight = getBarHeight(participant.position)
        const barColors = getBarColor(participant.position)
        const isActive = index <= activeIndex
        const isFirstPlace = participant.position === 1
        const avatarUrl = getDiceBearAvatar(
          participant.authorEmail,
          participant.position
        )
        const noobTitle = getNoobTitle(participant.position, data?.length)
        const barWidth = 100
        const bugPaths = generateBugPaths(barHeight, barWidth)

        return (
          <div
            key={participant.authorEmail}
            className="relative flex flex-col items-center"
            style={{ width: '18%' }}
          >
            <div className="relative flex w-full flex-col items-center">
              <motion.div
                className="relative mb-6 flex w-full items-center justify-between"
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: isActive ? 1 : 0,
                  y: isActive ? 0 : 20,
                  transition: {
                    duration: 0.5,
                    ease: 'easeOut',
                    delay: isActive ? 0.2 : 0
                  }
                }}
              >
                <div className="relative">
                  <svg
                    width="70"
                    height="40"
                    viewBox="0 0 70 40"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="drop-shadow-md"
                  >
                    <path
                      d="M0 0H60C65.5228 0 70 4.47715 70 10V30C70 35.5228 65.5228 40 60 40H0V0Z"
                      fill={barColors.dark}
                    />
                    <path
                      d="M5 5H55C58.866 5 62 8.13401 62 12V28C62 31.866 58.866 35 55 35H5V5Z"
                      fill={barColors.light}
                    />
                    <path d="M0 40L10 30V40H0Z" fill={barColors.dark} />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-white">
                    {participant.avgScore.toFixed(1)}
                  </div>
                </div>

                <div
                  className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 p-0.5 shadow-lg"
                  style={{
                    borderColor: barColors.border,
                    backgroundColor: barColors.bg
                  }}
                >
                  <Image
                    src={avatarUrl || '/placeholder.svg'}
                    alt={participant.authorName || 'User'}
                    width={64}
                    height={64}
                    className="rounded-full object-cover"
                  />
                </div>
              </motion.div>

              <div className="relative w-full">
                <motion.div
                  className="relative w-full overflow-hidden rounded-t-lg border-2 shadow-lg"
                  initial={{ height: 0 }}
                  animate={{
                    height: isActive ? barHeight : 0,
                    transition: {
                      duration: 0.8,
                      ease: [0.34, 1.56, 0.64, 1],
                      delay: isActive ? 0.1 * index : 0
                    }
                  }}
                  style={{
                    backgroundColor: barColors.bg,
                    borderColor: barColors.border,
                    boxShadow: `0 0 15px ${barColors.shadow}`
                  }}
                >
                  <motion.div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform text-3xl font-bold"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{
                      opacity: isActive ? 1 : 0,
                      scale: isActive ? 1 : 0.5,
                      transition: { delay: isActive ? 0.3 : 0, duration: 0.4 }
                    }}
                    style={{ color: barColors.text }}
                  >
                    {participant.position}
                  </motion.div>

                  <div className="absolute inset-0 translate-x-full -rotate-45 animate-[shine_3s_infinite] bg-gradient-to-r from-transparent via-white to-transparent opacity-20" />

                  {isFirstPlace && animationComplete && (
                    <>
                      <div className="absolute right-0 bottom-4 left-0 flex justify-center">
                        <motion.div
                          className="text-xs font-medium text-white"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5, duration: 0.5 }}
                        >
                          <div className="text-center text-xs">
                            Pushed to prod with 38 bugs. Respect.
                          </div>
                        </motion.div>
                      </div>

                      <div className="absolute inset-0 overflow-hidden">
                        {bugPaths.map((bugPath, i) => (
                          <motion.div
                            key={i}
                            className="absolute left-1/2 -translate-x-1/2"
                            initial={{ opacity: 0 }}
                            animate={{
                              opacity: [0, 0.8, 0.8, 0.8, 0],
                              x: bugPath.path.x,
                              y: bugPath.path.y,
                              rotate: [0, 10, -5, 15, -10]
                            }}
                            transition={{
                              duration: bugPath.duration,
                              times: [0, 0.2, 0.5, 0.8, 1],
                              repeat: Number.POSITIVE_INFINITY,
                              repeatType: 'loop',
                              delay: bugPath.delay,
                              ease: 'linear'
                            }}
                          >
                            <BugIcon className="h-4 w-4 text-rose-500" />
                          </motion.div>
                        ))}
                      </div>
                    </>
                  )}
                </motion.div>
              </div>

              <motion.div
                className="mt-4 flex flex-col items-center justify-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity: isActive ? 1 : 0,
                  y: isActive ? 0 : 10,
                  transition: { delay: isActive ? 0.5 : 0, duration: 0.5 }
                }}
              >
                {participant.position === 1 && (
                  <div className="flex flex-col items-center">
                    <motion.div
                      animate={{
                        rotate: [0, 10, -10, 5, -5, 0],
                        scale: [1, 1.1, 1, 1.05, 1]
                      }}
                      transition={{
                        repeat: Number.POSITIVE_INFINITY,
                        duration: 3,
                        repeatType: 'reverse'
                      }}
                    >
                      <Trophy className="h-12 w-12 text-yellow-400 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] filter" />
                    </motion.div>

                    <motion.div
                      className="mt-1"
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.7, duration: 0.3 }}
                    >
                      <div className="relative">
                        <div className="relative h-5 w-24 overflow-hidden">
                          <div
                            className="absolute h-5 w-24 rounded-sm"
                            style={{ backgroundColor: barColors.dark }}
                          >
                            <div className="flex h-full items-center justify-center text-[10px] font-bold text-white">
                              NOOB CERTIFIED
                            </div>
                          </div>
                          <div
                            className="absolute bottom-0 -left-1 h-3 w-3 rotate-45"
                            style={{ backgroundColor: barColors.dark }}
                          ></div>
                          <div
                            className="absolute -right-1 bottom-0 h-3 w-3 rotate-45"
                            style={{ backgroundColor: barColors.dark }}
                          ></div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}
                {participant.position === 2 && (
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{
                      repeat: Number.POSITIVE_INFINITY,
                      duration: 2,
                      repeatType: 'reverse'
                    }}
                  >
                    <Award className="h-10 w-10 text-gray-300 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] filter" />
                  </motion.div>
                )}
                {participant.position === 3 && (
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{
                      repeat: Number.POSITIVE_INFINITY,
                      duration: 2,
                      repeatType: 'reverse'
                    }}
                  >
                    <Award className="h-10 w-10 text-amber-600 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] filter" />
                  </motion.div>
                )}
                {(participant.position === 4 || participant.position === 5) && (
                  <motion.div
                    animate={{ rotate: [0, 3, -3, 0] }}
                    transition={{
                      repeat: Number.POSITIVE_INFINITY,
                      duration: 2,
                      repeatType: 'reverse'
                    }}
                  >
                    <Medal className="h-8 w-8 text-blue-400 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] filter" />
                  </motion.div>
                )}
              </motion.div>

              <motion.div
                className="mt-2 flex flex-col items-center"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: isActive ? 1 : 0,
                  transition: { delay: isActive ? 0.6 : 0, duration: 0.3 }
                }}
              >
                <div className="max-w-full truncate px-1 text-center text-sm font-medium">
                  {participant.authorName?.split(' ')[0] ||
                    participant.authorEmail?.split('@')[0] ||
                    'User'}
                </div>
                <div className="text-muted-foreground max-w-full truncate px-1 text-center text-xs">
                  {noobTitle}
                </div>
              </motion.div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
