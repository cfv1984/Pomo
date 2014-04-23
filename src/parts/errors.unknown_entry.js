/**
 * Thrown when the required msg_id was not found
 *
 * @param string msg_id
 * @param string domain
 * @constructor
 */
Errors.UnknownEntryError = Errors.CustomError.extend({
    constructor: function (msg_id, domain) {
        var message;

        msg_id = !msg_id ? 'malformed' : msg_id;
        domain = !domain ? 'default_domain' : domain;

        message = "Message ID '" + msg_id + "' not found in domain '" + domain + "'";

        Errors.CustomError.call(this, message);
        this.name = "UnknownEntryError";
    }
});