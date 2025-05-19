'use strict';
function escapeRegExp(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
export { escapeRegExp, isValidJson };
