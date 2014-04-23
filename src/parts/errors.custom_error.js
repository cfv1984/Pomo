Errors.CustomError = Errors.Base.extend({
    constructor: function (message) {
        this.name = 'CustomError';
        this.message = message;
        this.stack = (new Error()).stack;
    }
});
Errors.CustomError.extend = extend;