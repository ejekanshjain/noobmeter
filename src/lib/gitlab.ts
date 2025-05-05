export const getGitlabCommitDiffs = async (
  host: string,
  project: string,
  commitId: string,
  token: string
) => {
  const res = await fetch(
    `https://${host}/api/v4/projects/${encodeURIComponent(project)}/repository/commits/${commitId}`,
    {
      headers: {
        'PRIVATE-TOKEN': token
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

  if (!data.parent_ids) return []

  if (data.parent_ids.length > 1) return []

  const res2 = await fetch(
    `https://${host}/api/v4/projects/${encodeURIComponent(project)}/repository/commits/${commitId}/diff`,
    {
      headers: {
        'PRIVATE-TOKEN': token
      }
    }
  )

  if (!res2.ok) {
    let err: any
    try {
      err = await res2.json()
    } catch {
      try {
        err = await res2.text()
      } catch {
        err = 'Unknown error'
      }
    }
    throw new Error(
      `Failed to fetch commit diff: ${res2.status} ${res2.statusText} ${typeof err === 'string' ? err : JSON.stringify(err)}`
    )
  }

  const data2 = await res2.json()

  if (!Array.isArray(data2)) {
    throw new Error('Invalid diff response format')
  }

  const filtered = data2.filter(file => {
    const path = file.new_path || file.old_path || ''
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
