/**
 * Thrown when attempting to load a PO-formatted string from an unknown or invalid adapter
 *
 * @param string mode
 * @constructor
 */
Errors.UnknownAcquisitionModeError = Errors.CustomError.extend({
    constructor: function (mode) {
        var message;

        mode = !mode ? 'None provided' : mode;
        message = 'PO files acquisition mode: "' + mode + '" is not valid.';

        Errors.CustomError.call(this, message);
        this.name = 'UnknownAcquisitionModeError';
    }
});