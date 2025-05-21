'use strict';
function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}
function isValidJson(string) {
    try {
        JSON.parse(string);
        return true;
    }
    catch (_e) {
        return false;
    }
}
export { clamp, isValidJson };
