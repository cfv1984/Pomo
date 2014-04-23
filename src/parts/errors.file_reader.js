/**
 * Thrown when the FileAdapter cannot read from the file specified for one reason or another

 * @param file
 * @constructor
 */
Errors.FileReaderError = Errors.CustomError.extend({
    constructor: function (file) {
        var message = 'Adapter cannot read from file: ' + file;
        Errors.CustomError.call(this, message);
        this.name = 'FileReaderError';
    }
});

Errors.FileReaderError.prototype = Errors.CustomError.prototype;
Errors.FileReaderError.prototype.constructor = Errors.CustomError;
