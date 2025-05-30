'use strict'
export default class Utils {
  public static has: (prop: string) => boolean = Object.prototype.hasOwnProperty
  public static clamp (value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value))
  }
  public static isValidJson (jsonString: string): boolean {
    try {
      JSON.parse(jsonString)
      return true
    } catch {
      return false
    }
  }
}