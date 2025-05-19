'use strict';
function isValidJson(string) {
    try {
        JSON.parse(string);
        return true;
    }
    catch (_e) {
        return false;
    }
}
export { isValidJson };
