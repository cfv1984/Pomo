/**
 * A kind of exception that is only thrown by Pomo
 *
 * @param message
 * @constructor
 */
Errors.Base = extend.call(Error, {
    toString: function(){
        return (this.name + ': ' + this.message);
    }
});