'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useTheme } from 'next-themes'
import type React from 'react'
import { useEffect, useState } from 'react'

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  delay?: number
}

export function FeatureCard({
  icon,
  title,
  description,
  delay = 0
}: FeatureCardProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-300'
  const bgColor = theme === 'dark' ? 'bg-[#1e293b80]' : 'bg-[#f8fafc80]'
  const textColor = theme === 'dark' ? 'text-[#f8fafc]' : 'text-[#0f172a]'
  const mutedTextColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-600'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5, scale: 1.02 }}
      className={`group relative overflow-hidden rounded-lg border ${borderColor} ${bgColor} p-6 backdrop-blur-sm`}
    >
      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[#00e6ff0d] via-transparent to-[#00ccb40d] opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>

      <div className="relative z-10">
        <div className="mb-4 w-fit rounded-full bg-[#00e6ff1a] p-2">
          <div className="text-[#00e6ff]">{icon}</div>
        </div>

        <h3 className={`mb-2 text-lg font-medium ${textColor}`}>{title}</h3>
        <p className={`mb-4 text-sm font-light ${mutedTextColor}`}>
          {description}
        </p>

        <a
          href="#"
          className="inline-flex items-center text-xs font-light text-[#00e6ff] transition-colors hover:text-[#00c8dd]"
        >
          Learn more
          <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" />
        </a>
      </div>
    </motion.div>
  )
}
