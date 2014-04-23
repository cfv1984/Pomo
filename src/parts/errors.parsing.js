/**
 * Thrown when the required msg_id was not found
 *
 * @param string msg_id
 * @param string domain
 * @constructor
 */
Errors.ParsingError = Errors.CustomError.extend({
    constructor: function (contents) {
        var message;

        message = "File contents '" + contents + "'are invalid, unexpected or cannot be parsed";

        Errors.CustomError.call(this, message);
        this.name = "UnknownEntryError";
    }
});