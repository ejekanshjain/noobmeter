import { google } from '@ai-sdk/google'
import { generateText } from 'ai'
import { getAuthorByEmail, getCommitScoresByAuthorId } from './db'

const authorEmail = 'chinubansal766@gmail.com'

const author = await getAuthorByEmail(authorEmail)

if (!author) {
  console.error(`Author with email ${authorEmail} not found`)
  process.exit(1)
}

const data = await getCommitScoresByAuthorId(author.id)

const model = google.languageModel('gemini-2.0-flash-exp')

const { text } = await generateText({
  model,
  messages: [
    {
      role: 'system',
      content: `You are a summarizer. You will be given a list of commit scores and messages. You will have to summarize all and build a user profile based on it. You can use words like Fuck, WTF and curse.`
    },
    {
      role: 'user',
      content: `Here's the data:-\n ${JSON.stringify(data)}`
    }
  ]
})

console.log(text)
