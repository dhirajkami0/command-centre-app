function validateIntent(intent) {

    if (!intent)
        return false;

    if (typeof intent !== "object")
        return false;

    if (typeof intent.domain !== "string")
        return false;

    if (typeof intent.intent !== "string")
        return false;

    if (typeof intent.entities !== "object")
        return false;

    if (typeof intent.confidence !== "number")
        return false;

    return true;

}

module.exports = {

    validateIntent

};