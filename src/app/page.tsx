'use client'

import { CodeEditor } from '@/components/HomePage/code-editor'
import { FeatureCard } from '@/components/HomePage/feature-card'
import { LoginModal } from '@/components/HomePage/login-modal'
import { NavBar } from '@/components/HomePage/nav-bar'
import { NoobMeter } from '@/components/HomePage/noobmeter'
import { Button } from '@/components/ui/button'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Code, Code2, GitBranch, Laugh, Trophy } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useRef, useState } from 'react'

export default function Home() {
  const { scrollY } = useScroll()
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0])
  const heroScale = useTransform(scrollY, [0, 400], [1, 0.9])
  const heroY = useTransform(scrollY, [0, 400], [0, 100])

  const [mounted, setMounted] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const { theme } = useTheme()

  const [typingText, setTypingText] = useState('')
  const fullText = 'How noob are you'
  const typingSpeed = 100
  const typingDelayStart = 500
  const typingRef = useRef({ isTyping: false })

  useEffect(() => {
    setMounted(true)

    const startTypingTimeout = setTimeout(() => {
      typingRef.current.isTyping = true
      typeText()
    }, typingDelayStart)

    const currentRef = typingRef.current

    return () => {
      clearTimeout(startTypingTimeout)
      currentRef.isTyping = false
    }
  }, [])

  const typeText = () => {
    let currentIndex = 0

    const typingInterval = setInterval(() => {
      if (!typingRef.current.isTyping) {
        clearInterval(typingInterval)
        return
      }

      if (currentIndex <= fullText.length) {
        setTypingText(fullText.substring(0, currentIndex))
        currentIndex++
      } else {
        clearInterval(typingInterval)
      }
    }, typingSpeed)

    return () => clearInterval(typingInterval)
  }

  const getColors = () => {
    if (theme === 'light') {
      return {
        bg: 'bg-[#f8fafc]',
        text: 'text-[#0a0b14]',
        textMuted: 'text-[#64748b]',
        grid: 'bg-[linear-gradient(to_right,rgba(0,66,184,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,66,184,0.05)_1px,transparent_1px)]',
        accent: {
          from: 'from-[#0042b8]',
          via: 'via-[#0954a5]',
          to: 'to-[#0e6c95]',
          border: 'border-[#0042b820]',
          bg: 'bg-[#0042b810]',
          text: 'text-[#0042b8]'
        },
        borderColor: 'border-[#e2e8f0]',
        button: {
          bg: 'bg-[#0042b8]',
          text: 'text-[#f8fafc]',
          hover: 'hover:bg-[#0042b8]/90'
        },
        buttonOutline: {
          border: 'border-[#e2e8f0]',
          text: 'text-[#0a0b14]',
          hover: 'hover:bg-[#f1f5f9]'
        },
        via: 'via-[#0042b8]/5'
      }
    }
    return {
      bg: 'bg-[#0a0b14]',
      text: 'text-[#f8fafc]',
      textMuted: 'text-[#94a3b8]',
      grid: 'bg-[linear-gradient(to_right,rgba(0,230,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,230,255,0.05)_1px,transparent_1px)]',
      accent: {
        from: 'from-[#00e6ff]',
        via: 'via-[#00ccb4]',
        to: 'to-[#00aa98]',
        border: 'border-[#00e6ff20]',
        bg: 'bg-[#00e6ff10]',
        text: 'text-[#00e6ff]'
      },
      borderColor: 'border-[#374151]',
      button: {
        bg: 'bg-[#00e6ff]',
        text: 'text-[#0a0b14]',
        hover: 'hover:bg-[#00e6ff]/90'
      },
      buttonOutline: {
        border: 'border-[#374151]',
        text: 'text-[#f8fafc]',
        hover: 'hover:bg-[#1e293b]'
      },
      via: 'via-[#00e6ff]/5'
    }
  }

  if (!mounted) return null

  const colors = getColors()

  return (
    <div className={`min-h-screen overflow-hidden ${colors.bg} ${colors.text}`}>
      <NavBar />
      <motion.section
        style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
        className="relative flex min-h-[90vh] flex-col items-center justify-center px-4 pt-20 sm:px-6 lg:px-8"
      >
        <div
          className={`absolute inset-0 z-0 ${colors.grid} bg-[size:30px_30px]`}
        ></div>

        <div className="z-10 container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="flex flex-col gap-6"
            >
              <div
                className={`mb-4 inline-flex w-fit items-center gap-2 rounded-full ${colors.accent.border} ${colors.accent.bg} px-3 py-1 text-xs font-light ${colors.accent.text}`}
              >
                <Laugh className="h-3 w-3" />
                <span>Measure your coding noobness with science!</span>
              </div>

              <h1 className="min-h-[3.5rem] text-3xl leading-tight font-light tracking-tight sm:min-h-[4.5rem] sm:text-4xl md:min-h-[5.5rem] md:text-5xl">
                {typingText}
                <span
                  className={`bg-gradient-to-r ${colors.accent.from} ${colors.accent.via} ${colors.accent.to} bg-clip-text text-transparent`}
                >
                  ?
                </span>
                <span
                  className={`ml-1 inline-block h-[1em] w-[2px] animate-pulse ${colors.accent.text}`}
                ></span>
              </h1>

              <p
                className={`max-w-xl text-xs leading-relaxed font-light ${colors.textMuted} sm:text-sm`}
              >
                Measuring noobness with scientific accuracy. Results may vary.
                Being a noob is not a medical condition..
              </p>

              <div className="mt-4 flex flex-wrap gap-4">
                <Button
                  size="lg"
                  className={`group rounded-md ${colors.button.bg} font-light ${colors.button.text} ${colors.button.hover}`}
                  onClick={() => setShowLoginModal(true)}
                >
                  Connect your GitHub
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="relative flex h-[400px] items-center justify-center overflow-hidden rounded-xl lg:h-[500px]"
            >
              <NoobMeter />
            </motion.div>
          </div>
        </div>
      </motion.section>

      <section id="code-editor" className="relative py-24">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-3xl font-light tracking-tight md:text-4xl">
              We analyze your code and give you a{' '}
              <span
                className={`bg-gradient-to-r ${colors.accent.from} ${colors.accent.via} ${colors.accent.to} bg-clip-text text-transparent`}
              >
                Noob Score
              </span>
            </h2>
            <p
              className={`mx-auto max-w-2xl text-sm font-light ${colors.textMuted}`}
            >
              Our advanced AI analyzes your coding patterns, commit messages,
              and code quality to determine your exact level of noobness.
              It&apos;s science!
            </p>
          </motion.div>

          <div className="relative">
            <CodeEditor />
          </div>
        </div>
      </section>

      <section id="features" className="relative py-24">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-3xl font-light tracking-tight md:text-4xl">
              Embrace your inner{' '}
              <span
                className={`bg-gradient-to-r ${colors.accent.from} ${colors.accent.via} ${colors.accent.to} bg-clip-text text-transparent`}
              >
                coding noob
              </span>
            </h2>
            <p
              className={`mx-auto max-w-2xl text-sm font-light ${colors.textMuted}`}
            >
              We all start somewhere. Noobmeter helps you track your progress
              from total noob to slightly less noob.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Code className="h-5 w-5" />}
              title="Code Analysis"
              description="We analyze your code quality, complexity, and patterns to determine your noob level with scientific precision."
              delay={0}
            />
            <FeatureCard
              icon={<GitBranch className="h-5 w-5" />}
              title="Commit History"
              description="Your commit messages tell a story. Usually a story of confusion, desperation, and occasional triumph."
              delay={0.1}
            />
            <FeatureCard
              icon={<Trophy className="h-5 w-5" />}
              title="Noob Leaderboard"
              description="Compare your noobness with friends and teammates. Someone has to be the biggest noob!"
              delay={0.2}
            />
          </div>
        </div>
      </section>

      <section className="relative py-24">
        <div
          className={`absolute inset-0 bg-gradient-to-b from-transparent ${colors.via} to-transparent`}
        ></div>
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <StatCard
              number="10K+"
              label="Noobs Analyzed"
              accentFrom={colors.accent.from}
              accentVia={colors.accent.via}
              accentTo={colors.accent.to}
              textMuted={colors.textMuted}
            />
            <StatCard
              number="42M+"
              label="Lines of Noob Code"
              accentFrom={colors.accent.from}
              accentVia={colors.accent.via}
              accentTo={colors.accent.to}
              textMuted={colors.textMuted}
            />
            <StatCard
              number="7.3"
              label="Avg Noob Score"
              accentFrom={colors.accent.from}
              accentVia={colors.accent.via}
              accentTo={colors.accent.to}
              textMuted={colors.textMuted}
            />
            <StatCard
              number="99%"
              label="Secretly Noobs"
              accentFrom={colors.accent.from}
              accentVia={colors.accent.via}
              accentTo={colors.accent.to}
              textMuted={colors.textMuted}
            />
          </div>
        </div>
      </section>

      <section className="relative py-24">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mx-auto max-w-4xl text-center"
          >
            <h2 className="mb-6 text-3xl font-light tracking-tight md:text-4xl">
              Ready to discover your{' '}
              <span
                className={`bg-gradient-to-r ${colors.accent.from} ${colors.accent.via} ${colors.accent.to} bg-clip-text text-transparent`}
              >
                noob level
              </span>
              ?
            </h2>
            <p className={`mb-8 text-sm font-light ${colors.textMuted}`}>
              Connect your GitHub account and get your personalized noob
              analysis in seconds.
            </p>
            <Button
              size="lg"
              className={`group rounded-md ${colors.button.bg} font-light ${colors.button.text} ${colors.button.hover}`}
              onClick={() => setShowLoginModal(true)}
            >
              Connect GitHub Now
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </motion.div>
        </div>
      </section>

      <footer className={`border-t ${colors.borderColor} py-12`}>
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="col-span-2">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div
                    className={`absolute inset-0 rounded-full ${colors.accent.bg} blur-md`}
                  ></div>
                  <Code2 className={`relative h-6 w-6 ${colors.accent.text}`} />
                </div>
                <span
                  className={`bg-gradient-to-r ${colors.accent.from} ${colors.accent.via} ${colors.accent.to} bg-clip-text text-xl font-bold text-transparent`}
                >
                  NOOBMETER
                </span>
              </div>
              <p className={`mt-4 text-xs font-light ${colors.textMuted}`}>
                © {new Date().getFullYear()} Noobmeter. Measuring noobness with
                scientific accuracy.
              </p>
              <p className={`mt-2 text-xs font-light ${colors.textMuted}`}>
                Results may vary. Being a noob is not a medical condition.
              </p>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-medium">Features</h3>
              <ul className="space-y-2">
                {[
                  'Code Analysis',
                  'Commit History',
                  'Noob Score',
                  'Team Rankings',
                  'Improvement Tips',
                  'Noob Badges'
                ].map(item => (
                  <li key={item}>
                    <a
                      href="#"
                      className={`text-xs font-light ${colors.textMuted} transition-colors hover:${colors.text}`}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-medium">Company</h3>
              <ul className="space-y-2">
                {[
                  'About Us',
                  'Blog',
                  'Noob Stories',
                  'Careers',
                  'Contact',
                  'Privacy Policy'
                ].map(item => (
                  <li key={item}>
                    <a
                      href="#"
                      className={`text-xs font-light ${colors.textMuted} transition-colors hover:${colors.text}`}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </footer>

      <LoginModal open={showLoginModal} onOpenChange={setShowLoginModal} />
    </div>
  )
}

function StatCard({
  number,
  label,
  accentFrom,
  accentVia,
  accentTo,
  textMuted
}: {
  number: string
  label: string
  accentFrom: string
  accentVia: string
  accentTo: string
  textMuted: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <h3
        className={`mb-2 bg-gradient-to-r ${accentFrom} ${accentVia} ${accentTo} bg-clip-text text-3xl font-light text-transparent md:text-4xl`}
      >
        {number}
      </h3>
      <p className={`text-xs font-light ${textMuted}`}>{label}</p>
    </motion.div>
  )
}
