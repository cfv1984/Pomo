/**
 * "Abstract" Adapter. Just sets the translation domain
 *
 * @param domain
 * @constructor
 */
Providers.Base = function (domain) {
    var me = this, consumer_callback = [], has = Object.prototype.hasOwnProperty;
    me.domain = domain;
    me.waiting = true;
    me.notifyConsumers = function(data){
        for(var pos in consumer_callback){
            if(has.call(consumer_callback,pos)){
                consumer_callback[pos].call(consumer_callback[pos], data);
            }
        }
        me.waiting = true;
    }
    me.done = function (callback) {
        consumer_callback.push(callback);
        var itv = setInterval(function () {
            if (!me.waiting) {
                me.notifyConsumers(me.parsed);
                clearInterval(itv);
            }
        }, 4);
    }
};
Providers.Base.prototype = {
    toString: function () {
        return '[object Adapter]'
    },
    getContents: function(){}

};
Providers.Base.extend = extend;