'use strict'
function clamp (value, min, max): number {
  return Math.min(max, Math.max(min, value))
}

function isValidJson (string): boolean {
  try {
    JSON.parse(string)
    return true
  } catch (_e) {
    return false
  }
}
export { clamp, isValidJson }
