export const getNoobTitle = (position: number, dataLength: number) => {
  const titles = {
    1: [
      '404 IQ Found',
      'Senior Junior Developer',
      'CTRL+C CTO',
      'Works on My Machine™',
      'Bug-Driven Developer'
    ],
    2: [
      'Stack Overflow Intern',
      'Alt+F4 Specialist',
      'Git Revert Enthusiast',
      'Reacted Too Hard',
      'Weekend Deployer'
    ],
    3: [
      'Merge Conflict Magnet',
      'Typescript Optional™',
      'Self-Taught, Uncorrected',
      'Unhandled Promise Rejection',
      'Keyboard Shortcut Abuser'
    ],
    4: [
      'Linter? Never Heard of Her',
      'Junior Senior Architect',
      'Wrote It in Prod First',
      'All Tests Skipped™',
      'Professional Rubber Ducker'
    ],
    5: [
      'Trying Their Best',
      'Code Review Survivor',
      'Stack Overflow Apprentice',
      'Occasional Bug Maker',
      'Almost Acceptable Coder'
    ]
  }

  const pool = titles[position as keyof typeof titles]
  if (!pool) return 'Noob of Unknown Rank'

  const seed = position + (dataLength % pool.length)
  return pool[seed % pool.length]
}

export const elegantColors = [
  '#0ea5e9', // Sky blue
  '#06b6d4', // Cyan
  '#0891b2', // Cyan/teal
  '#0d9488', // Teal
  '#14b8a6' // Teal/emerald
]

export const getDiceBearAvatar = (seed: string, position: number) => {
  // Different DiceBear styles for different positions
  const styles = ['adventurer', 'big-ears', 'big-smile', 'croodles']
  const style = styles[position % styles.length]
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}`
}
