(function (ctx)
{
    var noop = function () {}, instance;

/**
 * Utility functions used throughout pomo
 */

/**
 * Add trimming to the String type. It is something that should be present anyway.
 */
if (!String.prototype.trim) {
    String.prototype.trim = function () {
        return this.replace(/^\s+|\s+$/g, '');
    };
}

/**
 * sprintf in javascript
 * @see http://www.diveintojavascript.com/projects/javascript-sprintf
 */
var sprintf = (function () {
    function get_type(variable) {
        return Object.prototype.toString.call(variable).slice(8, -1).toLowerCase();
    }

    function str_repeat(input, multiplier) {
        for (var output = []; multiplier > 0; output[--multiplier] = input) {/* do nothing */
        }
        return output.join('');
    }

    var str_format = function () {
        if (!str_format.cache.hasOwnProperty(arguments[0])) {
            str_format.cache[arguments[0]] = str_format.parse(arguments[0]);
        }
        return str_format.format.call(null, str_format.cache[arguments[0]], arguments);
    };

    str_format.format = function (parse_tree, argv) {
        var cursor = 1, tree_length = parse_tree.length, node_type = '', arg, output = [], i, k, match, pad, pad_character, pad_length;
        for (i = 0; i < tree_length; i++) {
            node_type = get_type(parse_tree[i]);
            if (node_type === 'string') {
                output.push(parse_tree[i]);
            } else if (node_type === 'array') {
                match = parse_tree[i];
                // convenience purposes only
                if (match[2]) {// keyword argument
                    arg = argv[cursor];
                    for (k = 0; k < match[2].length; k++) {
                        if (!arg.hasOwnProperty(match[2][k])) {
                            throw (sprintf('[sprintf] property "%s" does not exist', match[2][k]));
                        }
                        arg = arg[match[2][k]];
                    }
                } else if (match[1]) {// positional argument (explicit)
                    arg = argv[match[1]];
                } else {// positional argument (implicit)
                    arg = argv[cursor++];
                }

                if (/[^s]/.test(match[8]) && (get_type(arg) != 'number')) {
                    throw (sprintf('[sprintf] expecting number but found %s', get_type(arg)));
                }
                switch (match[8]) {
                    case 'b':
                        arg = arg.toString(2);
                        break;
                    case 'c':
                        arg = String.fromCharCode(arg);
                        break;
                    case 'd':
                        arg = arg >> 0;
                        break;
                    case 'e':
                        arg = match[7] ? arg.toExponential(match[7]) : arg.toExponential();
                        break;
                    case 'f':
                        arg = match[7] ? parseFloat(arg).toFixed(match[7]) : parseFloat(arg);
                        break;
                    case 'o':
                        arg = arg.toString(8);
                        break;
                    case 's':
                        arg = (( arg = String(arg)) && match[7] ? arg.substring(0, match[7]) : arg);
                        break;
                    case 'u':
                        arg = Math.abs(arg);
                        break;
                    case 'x':
                        arg = arg.toString(16);
                        break;
                    case 'X':
                        arg = arg.toString(16).toUpperCase();
                        break;
                }
                arg = (/[def]/.test(match[8]) && match[3] && arg >= 0 ? '+' + arg : arg);
                pad_character = match[4] ? match[4] === '0' ? '0' : match[4].charAt(1) : ' ';
                pad_length = match[6] - String(arg).length;
                pad = match[6] ? str_repeat(pad_character, pad_length) : '';
                output.push(match[5] ? arg + pad : pad + arg);
            }
        }
        return output.join('');
    };

    str_format.cache = {};

    str_format.parse = function (fmt) {
        var _fmt = fmt, match = [], parse_tree = [], arg_names = 0;
        while (_fmt) {
            if (( match = /^[^\x25]+/.exec(_fmt)) !== null) {
                parse_tree.push(match[0]);
            } else if (( match = /^\x25{2}/.exec(_fmt)) !== null) {
                parse_tree.push('%');
            } else if (( match = /^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fosuxX])/.exec(_fmt)) !== null) {
                if (match[2]) {
                    arg_names |= 1;
                    var field_list = [], replacement_field = match[2], field_match = [];
                    if (( field_match = /^([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {
                        field_list.push(field_match[1]);
                        while (( replacement_field = replacement_field.substring(field_match[0].length)) !== '') {
                            if (( field_match = /^\.([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {
                                field_list.push(field_match[1]);
                            } else if (( field_match = /^\[(\d+)\]/.exec(replacement_field)) !== null) {
                                field_list.push(field_match[1]);
                            } else {
                                throw ('[sprintf] huh?');
                            }
                        }
                    } else {
                        throw ('[sprintf] huh?');
                    }
                    match[2] = field_list;
                } else {
                    arg_names |= 2;
                }
                if (arg_names === 3) {
                    throw ('[sprintf] mixing positional and named placeholders is not (yet) supported');
                }
                parse_tree.push(match);
            } else {
                throw ('[sprintf] huh?');
            }
            _fmt = _fmt.substring(match[0].length);
        }
        return parse_tree;
    };

    return str_format;
})();

/**
 * vsprintf in javascript
 * @see see http://www.diveintojavascript.com/projects/javascript-sprintf
 */
var vsprintf = function (fmt, argv) {
    argv.unshift(fmt);
    return sprintf.apply(null, argv);
};

/**
 * Determines if the script is being ran in a browser
 * @returns {boolean}
 */
var isBrowser = function () {
    return (typeof(window) !== 'undefined' && !!document && !!document.getElementsByTagName);
};


/**
 * Escapes a string in such a way that most whitespace is visible
 *
 * @param val
 * @returns {string|Pomo.Parser.Object}
 */
var escapeString = function (val) {
    var return_value;
    if (val.constructor != String()) {
        return_value = val;
    }
    if (val.replace) {
        return_value = val
            .replace(/[\"]/g, '\\"')
            .replace(/[\\]/g, '\\')
            .replace(/[\/]/g, '\/')
            .replace(/[\b]/g, '\\b')
            .replace(/[\f]/g, '\\f')
            .replace(/[\n]/g, '\\n')
            .replace(/[\r]/g, '\\r')
            .replace(/[\t]/g, '\\t');
    }

    return return_value;
};

/**
 * Unescapes a string like the output of escapeString()
 *
 * @param val
 * @returns string
 */
var unescapeString = function (val) {
    var return_value;
    if (!!val && !!val.replace) {
        return_value = val
            .replace("\\n", '\n')
            .replace("\\r", '\r')
            .replace("\\t", '\t')
            .replace("\\f", '\f')
            .replace("\\b", '\b')
            .replace("\\r", '\r');
    }

    return return_value;
};

/**
 * Waits until Pomo is ready to do something with its data
 * @param callback
 */
var waitUntilReady = function (callback) {
    var itv = setInterval(function () {
        if (!!instance && !instance.waiting) {
            clearInterval(itv);
            callback.call(callback);
        }
    }, 4);
};

/**
 * Enables a semblance of classical inheritance.
 * @see http://backbonejs.org/docs/backbone.html#section-208
 *
 * @param protoProps
 * @param staticProps
 * @returns {*}
 */
var extend = function(protoProps, staticProps) {
    var parent = this;
    var child, has = Object.prototype.hasOwnProperty;
        if (protoProps && has.call(protoProps, 'constructor')) {
        child = protoProps.constructor;
    }
        else {
        child = function(){ return parent.apply(this, arguments); };
    }
    if(staticProps)
    for(var static_prop in staticProps){
        child[static_prop] = staticProps[static_prop];
    }
    var Surrogate = function(){ this.constructor = child; };
    Surrogate.prototype = parent.prototype;
    child.prototype = new Surrogate;

    if (protoProps)
    for(var proto_prop in protoProps){
        child.prototype[proto_prop] = protoProps[proto_prop];
    }
    child.extend = extend;
    child.__super__ = parent.prototype;

    return child;
};

/**
 * Determines if the sought entry actually exist in the general storage hash
 *
 * @param domain
 * @param escaped
 * @returns {boolean}
 */

entryExists = function (hash, domain, escaped) {
    return !!hash && !!hash.contents && !!hash.contents[domain] && !!hash.contents[domain][escaped];
};

/**
 * Errors namespace
 * @type {Error.CustomError,...}
 */
var Errors = {};
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
Errors.CustomError = Errors.Base.extend({
    constructor: function (message) {
        this.name = 'CustomError';
        this.message = message;
        this.stack = (new Error()).stack;
    }
});
Errors.CustomError.extend = extend;
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
/**
 * The Parser namespace
 * @type {{Parser.Object, Parser.POFiles}}
 */
var Parser = {};

/**
 * Defines a PO catalog entry based on the info extracted from a raw catalog entry
 *
 * @param msg
 * @constructor
 */
Parser.Object = function (msg) {
    var me = this, phrase_count = 1;
    //singular by default
    for (var key in msg) {
        this[key] = msg[key];
    }
    /**
     * Set the amount of subjects involved in the catalog entry
     * @param amount
     */
    this.setCount = function (amount) {
        phrase_count = amount >> 0;
    };
    /**
     * Cast entry as a string
     * @returns string
     */
    this.toString = function () {
        var return_value, canGetPluralIndex;

        canGetPluralIndex = !this.isPlural && this.plural_forms && this.plural_forms.push && !!Parser.Object.calculatePluralIndex;
        if (canGetPluralIndex) {
            var idx = Parser.Object.calculatePluralIndex(phrase_count);
            return_value = this.plural_forms[idx];
        } else {
            return_value = this.translation;
        }

        return return_value;
    }
};

/**
 * The PO files parser
 *
 * @type {{parse: Function, generate: Function}}
 */
Parser.POFiles = {
    /**
     * Parse a PO-formatted string into a series of catalog entries
     *
     * @param text
     * @param translation_domain
     * @returns Object (a Dictionary with msgid for keys)
     */
    parse: function (text, translation_domain) {
        text = !text? '' : text;
        var getTelltale, extractHeaderInfo, isMultilinePlural, multilineExtract;

        /**
         * Grab the first word of the line to tell what type of entity it is
         *
         * @param str
         * @returns string
         */
        getTelltale = function (str) {
            return str.substring(0, 12).split(' ')[0].trim();
        };

        /**
         * Determine if a given line is actually a multiline plural
         *
         * @param line
         * @returns boolean
         */
        isMultilinePlural = function (line) {
            return (!!line && line.match(/msgstr\[[0-9]\]/));
        };

        /**
         * Pull the header information from the first complete block in the string
         *
         * @todo refactor eval in me.storage.calculatePluralIndex
         * @param string header
         */
        extractHeaderInfo = function (header) {
            var header_lines = header.split("\n");
            for (var i = 0, j = header_lines.length; i < j; i++) {
                var header_line = header_lines[i];
                if (header_line.indexOf('"Plural-Forms: nplurals') === 0) {
                    var plural_form = header_line.substring(14).slice(0, -1);
                    /**
                     * Append plural detection
                     *
                     * @param phrase_count
                     * @returns {number}
                     */

                    Parser.Object.calculatePluralIndex = function (phrase_count) {
                        eval(unescapeString(plural_form));
                        if (typeof(plural) === 'undefined') {
                            plural = 0;
                        }
                        return plural;
                    }
                }
            }
        };

        /**
         * Walk the lines for this part until the entire multiline buffer is recovered
         *
         * @param [string,...]
         */
        multilineExtract = function (part_lines) {
            var buffer = [], possible;
            //todo: find a means to abstract this out
            while (possible = part_lines.shift()) {
                possible = possible.trim();
                if (possible.indexOf('"') === 0) {
                    buffer.push(possible.substring(1).slice(0, -1));
                }
                else {
                    part_lines.unshift(possible);
                    break;
                }
            }
            return buffer.join("");
        };

        var parsed = {},
            has_header_info,
            header_info,
            part,
            domain = ( typeof (translation_domain) === 'undefined') ? 'messages' : translation_domain,
            counter = 0,
            text = text.replace(/\r\n|\r/g, "\n"),
            parts;

        parsed[domain] = {};
        parts = text.split(/\n\n/);
        header_info = parts.shift();
        has_header_info = extractHeaderInfo(header_info);

        if (!has_header_info) {
            parts.unshift(header_info);
        }
        else {
            Parser.header_info = extractHeaderInfo(has_header_info);
        }

        while (part = parts.shift()) {
            var message = {},
                part_lines = !!part ? part.split(/\n/) : [],
                line = '',
                escaped;

            while (line = part_lines.shift()) {
                line = line.trim();
                var next_line = part_lines.slice(0, -1)[0],
                    line_telltale = getTelltale(line),
                    next_line_telltale = next_line ? getTelltale(next_line) : false;

                switch (line_telltale) {
                    case 'msgctxt':
                        message.context = line.substring(9).slice(0, -1);
                        break;
                    case 'msgid_plural':
                        message.isPlural = true;
                        message.plural_id = line.substring(14).slice(0, -1);
                        break;
                    case 'msgid':
                        if (line.indexOf('msgid ""') === 0) {
                            var possible = next_line.trim();
                            if (possible.indexOf('"') === 0) {//multiline
                                message.id = multilineExtract(part_lines)
                            }
                        }
                        else {
                            if (next_line_telltale = 'msgstr') {
                                message.id = line.substr(7).slice(0, -1);
                            }
                        }
                        continue;
                    case 'msgstr':
                        if (line.indexOf('msgstr ""') === 0) {
                            possible = next_line.trim();
                            if (possible.indexOf('"') === 0) {
                                message.translation = multilineExtract(part_lines);
                            }
                        }
                        else {
                            message.translation = line.substr(8).slice(0, -1);
                        }
                        break;
                    case '#:':
                    case '#.':
                    case '#':
                        continue;
                    case '#,':
                        break;
                    default:
                        if (isMultilinePlural(line)) {
                            var cases = [];
                            while (isMultilinePlural(line)) {
                                cases.push(line.substring(10).slice(0, -1));
                                line = part_lines.shift();
                            }
                            message.plural_forms = cases;
                            message.translation = cases[0];
                        }
                        continue;
                }
            }

            if (!!message.id && !!message.translation) {
                message = new Parser.Object(message);
                escaped = escapeString(message.id);
                if (!parsed[domain][message.id]) {
                    parsed[domain][escaped] = [message];
                } else {
                    parsed[domain][escaped].push(message);
                }
            }
            counter++;
        }

        return parsed;
    },
    /**
     * @throws Feature Unimplemented
     */
    generate: function () {
        throw "Feature unimplemented";
    }
};
/**
 * All supported providers
 * @type {{}}
 */
var Providers = {};
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
Providers.String = Providers.Base.extend({
    /**
     * Load the contents of a string into the dictionary
     *
     * @param literal_string
     * @param domain
     * @constructor
     */
    constructor: function (literal_string, domain) {
        Providers.Base.call(this, domain);
        this.parsed = null;
        this.unparsed = '' + literal_string;
    },
    getContents: function () {
        var me = this, parsed;
        parsed = Parser.POFiles.parse(this.unparsed, this.domain);
        if(!parsed){
            throw new Errors.ParsingError(this.unparsed);
        }
        me.parsed = parsed;
        me.notifyConsumers(me.parsed);
    }
});
if (!isBrowser()) {
    Providers.File = Providers.Base.extend({
        /**
         * Load the contents of a file into the dictionary
         * @param path_to_file
         * @param domain
         * @constructor
         */
        constructor: function (path_to_file, domain) {
            Providers.Base.call(this, domain);
            this.path = '' + path_to_file;
        },
        getContents: function () {
            var me = this;
            instance.waiting = true;
            me.waiting = true;
            require('fs').readFile(this.path, 'utf-8', function (err, data) {
                if (!err) {
                    me.parsed = Parser.POFiles.parse(data, me.domain);
                    me.waiting = false;
                }
                else {
                    throw new Errors.FileReaderError(err.path);
                }
            });
        }
    });
}
else{
    console.log('wat');
}
if (isBrowser()) {
    Providers.Ajax = Providers.Base.extend({
        /**
         * Read the result of an AJAX call into the dictionary
         * @param url
         * @param domain
         * @constructor
         */
        constructor: function (url, domain) {
            Providers.Base.call(this, domain);
            this.url = url;
        },
        /**
         * Make an AJAX GET request to some source
         * @param string url
         * @param callable success
         * @see http://youmightnotneedjquery.com/#json
         */
        doRequest: function (url, success, error) {
            var request = new XMLHttpRequest(), noop = function(){};
            request.open('GET', url, true);
            success = !success ? noop : success;
            error = !error ? noop : error;
            try {
                request.onreadystatechange = function () {
                    var data = {error: true};
                    if (this.readyState === 4) {
                        if (this.status >= 200 && this.status < 400) {
                            data = this.responseText;
                            success.call(success, data);
                        }
                        else {
                            error.call(error, data);
                        }
                    }
                };

                request.send();
            }
            catch (Whatever) {
                error.call(error, {error: true});
            }
            request = null;
        },
        /**
         * Read all <link> elements with a type="text/x-gettext-translation" into the dictionary
         * @param domain
         * @constructor
         */
        getContents: function () {
            var domain = this.domain, me = this;
            me.waiting = true;
            this.doRequest(this.url, function (result) {
                var adapter = new Providers.String(result, domain);
                adapter.done(function(data){
                    me.parsed = data;
                    me.notifyConsumers(data);
                });
                adapter.getContents();
            });
        }
    });
}
if (isBrowser()) {
    Providers.Links = Providers.Ajax.extend({
        constructor: function(domain){
            Providers.Ajax.call(this,domain);
            this.domain = domain;
        },
        getContents: function () {
            var links = document.getElementsByTagName('link'), link, Ajax = Providers.Ajax, me = this;
            me.waiting = true;
            for (var i = 0, j = links.length; i < j; i++) {
                link = links[i];
                if (
                    !!link
                    && !!link.getAttribute('type')
                    && !!link.getAttribute('href')
                    && link.getAttribute('type') === 'text/x-gettext-translation'
                    ) {
                    me.waiting = true;
                    this.doRequest(link.href, function (result) {
                        var adapter = new Providers.String(result, me.domain);
                        adapter.done(function(data){
                            me.parsed = data;
                            me.notifyConsumers(data);
                        });
                        adapter.getContents();
                    });
                }
            }
        }
    });
}
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
instance = new Pomo();
if (typeof (module) !== 'undefined') {
    module.exports = instance;
}
else {
    window['Pomo'] = instance;
}
})(this);