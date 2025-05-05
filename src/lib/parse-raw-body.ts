export const parseRawBody = async (
  readable: ReadableStream<Uint8Array>
): Promise<Buffer> => {
  const reader = readable.getReader()
  const chunks = []
  let done: boolean | undefined
  while (!done) {
    const { value, done: doneReading } = await reader.read()
    if (value) chunks.push(value)
    done = doneReading
  }
  return Buffer.concat(chunks.map(chunk => Buffer.from(chunk)))
}
