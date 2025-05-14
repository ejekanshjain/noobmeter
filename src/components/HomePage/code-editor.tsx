'use client'

import { motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

export function CodeEditor() {
  const editorRef = useRef<HTMLDivElement>(null)
  const [currentLine, setCurrentLine] = useState(0)
  const [isTyping, setIsTyping] = useState(true)

  const codeLines = [
    { text: 'function analyzeNoobLevel(code) {', type: 'function' },
    { text: '  // Check for classic noob mistakes', type: 'comment' },
    {
      text: '  const noobMistakes = findNoobMistakes(code);',
      type: 'variable'
    },
    { text: '', type: 'empty' },
    { text: '  // Calculate noob score based on metrics', type: 'comment' },
    { text: '  const noobScore = calculateNoobScore({', type: 'variable' },
    {
      text: "    varNames: checkVariableNames(code), // 'x', 'temp', 'foo'",
      type: 'property'
    },
    {
      text: '    comments: countComments(code), // Usually none',
      type: 'property'
    },
    {
      text: "    indentation: checkIndentation(code), // What's that?",
      type: 'property'
    },
    {
      text: '    copiedFromStackOverflow: detectCopiedCode(code) // 87%',
      type: 'property'
    },
    { text: '  });', type: 'punctuation' },
    { text: '', type: 'empty' },
    { text: '  return {', type: 'keyword' },
    { text: '    score: noobScore,', type: 'property' },
    { text: '    mistakes: noobMistakes,', type: 'property' },
    {
      text: '    feedback: generateNoobFeedback(noobMistakes, noobScore),',
      type: 'property'
    },
    {
      text: "    rank: determineNoobRank(noobScore) // 'Total Noob' to 'Almost Pro'",
      type: 'property'
    },
    { text: '  };', type: 'punctuation' },
    { text: '}', type: 'punctuation' }
  ]

  useEffect(() => {
    if (!isTyping) return

    const typingInterval = setInterval(() => {
      if (currentLine < codeLines.length - 1) {
        setCurrentLine(prev => prev + 1)
      } else {
        setIsTyping(false)
        setTimeout(() => {
          setCurrentLine(0)
          setIsTyping(true)
        }, 3000)
      }
    }, 150)

    return () => clearInterval(typingInterval)
  }, [currentLine, isTyping, codeLines.length])

  const getLineColor = (type: string) => {
    switch (type) {
      case 'import':
        return 'text-purple-400'
      case 'comment':
        return 'text-gray-500'
      case 'const':
        return 'text-blue-400'
      case 'property':
        return 'text-green-400'
      case 'punctuation':
        return 'text-gray-300'
      case 'function':
        return 'text-yellow-300'
      case 'keyword':
        return 'text-pink-400'
      case 'console':
        return 'text-blue-300'
      case 'return':
        return 'text-pink-400'
      case 'catch':
        return 'text-pink-400'
      case 'error':
        return 'text-red-400'
      case 'throw':
        return 'text-red-400'
      case 'call':
        return 'text-blue-300'
      case 'variable':
        return 'text-blue-400'
      default:
        return 'text-gray-300'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
      className="border-border relative overflow-hidden rounded-lg border shadow-xl"
    >
      <div className="from-primary/5 to-secondary/5 absolute inset-0 rounded-lg bg-gradient-to-br via-transparent"></div>

      <div className="bg-card/80 border-border flex h-10 items-center border-b px-4">
        <div className="flex space-x-2">
          <div className="h-3 w-3 rounded-full bg-red-500"></div>
          <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
          <div className="h-3 w-3 rounded-full bg-green-500"></div>
        </div>
        <div className="text-muted-foreground ml-4 text-xs font-light">
          noob-analyzer.js
        </div>
      </div>

      <div
        ref={editorRef}
        className="bg-card/50 max-h-[500px] overflow-auto p-4 font-mono text-xs backdrop-blur-sm md:text-sm"
      >
        <div className="relative">
          {codeLines.map((line, index) => (
            <div key={index} className="flex">
              <span className="text-muted-foreground w-8 opacity-50 select-none">
                {index + 1}
              </span>
              <span
                className={`${getLineColor(line.type)} ${index > currentLine ? 'opacity-0' : 'opacity-100'} transition-opacity duration-100`}
              >
                {line.text}
              </span>
              {index === currentLine && (
                <span className="bg-primary ml-1 h-4 w-2 animate-pulse"></span>
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
