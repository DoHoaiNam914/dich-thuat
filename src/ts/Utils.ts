'use strict'
function isValidJson (string): boolean {
  try {
    JSON.parse(string)
    return true
  } catch (_e) {
    return false
  }
}
export { isValidJson }
