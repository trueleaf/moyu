type UrlVariableCandidate = {
  token: string
  value: string
}
// 判断变量值是否是粘贴地址的完整前缀
const isUrlPrefix = (url: string, prefix: string): boolean => {
  try {
    new URL(url)
    new URL(prefix)
  } catch {
    return false
  }
  if (!url.startsWith(prefix)) {
    return false
  }
  if (url.length === prefix.length || /[/?#]$/.test(prefix)) {
    return true
  }
  return /[/?#]/.test(url[prefix.length])
}
// 获取当前地址中可解析的变量候选
const getCurrentCandidates = (currentPath: string, variables: Record<string, unknown>): UrlVariableCandidate[] => {
  const candidates: UrlVariableCandidate[] = []
  const matchedTokens = currentPath.matchAll(/\{\{\s*([^{}]+?)\s*\}\}/g)
  for (const matchedToken of matchedTokens) {
    const label = matchedToken[1].trim()
    const value = variables[label]
    if (typeof value !== 'string' || value.length === 0 || candidates.some(candidate => candidate.token === matchedToken[0])) {
      continue
    }
    candidates.push({ token: matchedToken[0], value })
  }
  return candidates
}
// 获取所有可解析的 URL 变量候选
const getAllCandidates = (variables: Record<string, unknown>): UrlVariableCandidate[] => {
  return Object.entries(variables)
    .filter((entry): entry is [string, string] => typeof entry[1] === 'string' && entry[1].length > 0)
    .map(([name, value]) => ({ token: `{{${name}}}`, value }))
}
// 从候选中取得唯一的最长 URL 前缀
const getUniqueLongestCandidate = (url: string, candidates: UrlVariableCandidate[]): UrlVariableCandidate | null => {
  const matchedCandidates = candidates.filter(candidate => isUrlPrefix(url, candidate.value))
  if (matchedCandidates.length === 0) {
    return null
  }
  const longestLength = Math.max(...matchedCandidates.map(candidate => candidate.value.length))
  const longestCandidates = matchedCandidates.filter(candidate => candidate.value.length === longestLength)
  return longestCandidates.length === 1 ? longestCandidates[0] : null
}
// 还原粘贴地址中的 URL 变量
export const restoreUrlVariableOnPaste = (pastedText: string, currentPath: string, variables: Record<string, unknown>): string => {
  const pastedUrl = pastedText.trim()
  const currentCandidate = getUniqueLongestCandidate(pastedUrl, getCurrentCandidates(currentPath, variables))
  const candidate = currentCandidate ?? getUniqueLongestCandidate(pastedUrl, getAllCandidates(variables))
  if (!candidate) {
    return pastedText
  }
  return `${candidate.token}${pastedUrl.slice(candidate.value.length)}`
}
