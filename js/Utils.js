'use strict';
/* global JSON5 */
class Utils {
    static clamp(value, min, max) {
        return Math.min(max, Math.max(min, value));
    }
    static isValidJson(jsonString) {
        try {
            // @ts-expect-error JSON5
            JSON5.parse(jsonString);
            return true;
        }
        catch {
            return false;
        }
    }
}
Utils.CORS_HEADER_PROXY = 'https://cors-header-proxy.itsdhnam.workers.dev/';
Utils.has = Object.prototype.hasOwnProperty;
export default Utils;
