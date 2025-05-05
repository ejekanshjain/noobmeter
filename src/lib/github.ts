export const getGithubCommitDiffs = async (
  host: string,
  project: string,
  commitId: string,
  token: string
) => {
  const res = await fetch(
    `https://api.${host}/repos/${project}/commits/${commitId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  )

  if (!res.ok) {
    let err: any
    try {
      err = await res.json()
    } catch {
      try {
        err = await res.text()
      } catch {
        err = 'Unknown error'
      }
    }
    throw new Error(
      `Failed to fetch commit diff: ${res.status} ${res.statusText} ${typeof err === 'string' ? err : JSON.stringify(err)}`
    )
  }

  const data = await res.json()

  if (!data.parents) {
    return []
  }

  if (data.parents.length > 1) {
    return []
  }

  if (!Array.isArray(data.files)) {
    throw new Error('Invalid diff response format')
  }

  const filtered = data.files.filter((file: any) => {
    const path = file.filename
    return !(
      path === 'package-lock.json' ||
      path.endsWith('.min.js') ||
      path.endsWith('.png') ||
      path.endsWith('.jpg') ||
      path.endsWith('.jpeg') ||
      path.endsWith('.webp') ||
      path.endsWith('.zip') ||
      path.endsWith('.ico') ||
      path.endsWith('.txt') ||
      path.endsWith('.md')
    )
  })

  return filtered
}
