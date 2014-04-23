/**
 * The Pomo object.
 * @constructor
 */
var Pomo = function () {
    var me = this, ready_callback;

    me.storage = {};
    me.waiting = true;
    me.VERSION = '0.1.3';
    me.domain = 'messages';
    me.returnStrings = false;
    me.unescapeStrings = false;
    /**
     * Wait until Pomo is ready to do something else
     * @param callback
     */
    me.ready = function (callback) {
        ready_callback = callback;
        var itv = setInterval(function () {
            if (!me.waiting) {
                clearInterval(itv);
                ready_callback.call(ready_callback);
            }
        }, 2);
    };

    me.wipe = function(){
        me.storage = {};
        me.waiting = true;
    };

    /**
     * Load a MO/PO file from somewhere using an adapter
     *
     * @param resource
     * @param options (an object with, at the very least: format -one of 'po' or 'mo'- and mode -one of 'literal','link', or 'ajax') as well as an optional translation_domain key
     * @return waiter
     * @throws Errors.UnknownAcquisitionModeError if options.mode is unknown
     */
    me.load = function (resource, options) {
        options = !options ? {} : options;

        me.waiting = true;

        var mode = !!options.mode ? options.mode : false,
            translation_domain = !!options.translation_domain ? options.translation_domain : 'messages',
            provider;

        //all usable flags are initialized here
        switch (mode) {
            case 'literal':
                provider = new Providers.String(resource, translation_domain);
                break;
            case 'file':
                provider = new Providers.File(resource, translation_domain);
                break;
            case 'link':
                provider = new Providers.Links(translation_domain);
                break;
            case 'ajax':
                provider = new Providers.Ajax(resource, translation_domain);
                break;
            default:
                throw new Errors.UnknownAcquisitionModeError(mode);
                break;
        }

        provider.done(function (data) {
            me.storage.contents = data;
            me.waiting = false;
        });

        provider.getContents();

        return this;
    };

    /**
     * Get a particular translation
     *
     * @param msg_id
     * @param options
     * @return Pomo.Parser.Object|String
     */
    me.getText = function (msg_id, options) {
        msg_id = msg_id.split(/\n/).join('');
        options = !options ? {} : options;

        var variables = !!options.variables ? options.variables : [],
            context = !!options.context ? options.context : false,
            domain = !!options.domain ? options.domain : 'messages',
            count = !!options.count ? options.count : false,
            error_callback = !options.error? noop : options.error,
            escaped = escapeString(msg_id);

        if (!domain && !me.domain) {
            domain = me.domain = 'messages';
        }
        else if (domain && !me.domain) {
            me.domain = domain;
        }
        else {
            me.domain = domain;
        }

        if (entryExists(me.storage, domain, escaped)) {
            var entry = me.storage.contents[domain][escaped];
            if (!!context) {
                for (var i = 0, j = entry.length; i < j; i++) {
                    if (entry.context && entry.context === context) {
                        translation = entry[i];
                        break;
                    }
                }
            }
            if (entry.unshift) {
                entry = entry[0];
            }
            if (!!count) {
                entry.setCount(count);
            }

            var translation = entry,
                is_bare_string = (entry.constructor === String());

            if (me.returnStrings) {
                translation = entry.toString();
            }
            if (!!variables) {
                var bare_string = is_bare_string ? translation : translation.translation,
                    translated = vsprintf(bare_string, variables);

                if (!is_bare_string) {
                    translation.translation = translated;
                }
                else {
                    translation = translated;
                }
            }
            if (is_bare_string && me.unescapeStrings) {
                translation = unescapeString(translation);
            }
            else if (me.unescapeStrings && !is_bare_string) {
                translation.translation = unescapeString(translation.translation);
            }

            return translation;
        }
        else {
            if(error_callback === noop){
                throw new Errors.UnknownEntryError(msg_id, domain);
            }
            else{
                error_callback(error_callback, msg_id, domain, me.storage.contents);
            }
        }
    };
};