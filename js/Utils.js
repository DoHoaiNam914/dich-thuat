'use strict'
class Utils {
  static clamp (value, min, max) {
    return Math.min(max, Math.max(min, value))
  }

  static isValidJson (jsonString) {
    try {
      JSON.parse(jsonString)
      return true
    } catch {
      return false
    }
  }
}
Utils.has = Object.prototype.hasOwnProperty
export default Utils
