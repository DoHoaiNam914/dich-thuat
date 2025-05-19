'use strict'
function escapeRegExp (text): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
function isValidJson (string): boolean {
  try {
    JSON.parse(string)
    return true
  } catch (_e) {
    return false
  }
}
export { escapeRegExp, isValidJson }
