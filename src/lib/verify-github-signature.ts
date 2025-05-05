import { createHmac, timingSafeEqual } from 'crypto'

export const verifyGitHubSignature = (
  rawBody: Buffer,
  signature: string | null,
  secret: string
) => {
  if (!signature) return false
  const hmac = createHmac('sha256', secret)
  hmac.update(rawBody)
  const digest = `sha256=${hmac.digest('hex')}`
  return timingSafeEqual(Buffer.from(signature), Buffer.from(digest))
}
