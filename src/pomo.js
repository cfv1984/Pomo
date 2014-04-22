(function (ctx)
{
    var noop = function () {
    }, sprintf, vsprintf, isBrowser, escapeString, unescapeString, Errors;

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
    sprintf = (function () {
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
    vsprintf = function (fmt, argv) {
        argv.unshift(fmt);
        return sprintf.apply(null, argv);
    };

    /**
     * Determines if the script is being ran in a browser
     * @returns {boolean}
     */
    isBrowser = function () {
        return (typeof(window) !== 'undefined' && !!document && !!document.getElementsByTagName);
    };


    /**
     * Escapes a string in such a way that most whitespace is visible
     *
     * @param val
     * @returns {string|Pomo.Parser.Object}
     */
    escapeString = function (val) {
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
    unescapeString = function (val) {
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
     * Errors namespace
     * @type {Error.CustomError,...}
     */
    Errors = {};

    /**
     * A kind of exception that is only thrown by Pomo
     *
     * @param message
     * @constructor
     */
    Errors.CustomError = function (message) {
        this.name = 'CustomError';
        this.message = message;
        this.stack = (new Error()).stack;
    };

    /**
     * Thrown when the required msg_id was not found
     *
     * @param string msg_id
     * @param string domain
     * @constructor
     */
    Errors.UnknownEntryError = function (msg_id, domain) {
        var message;

        msg_id = !msg_id ? 'malformed' : msg_id;
        domain = !domain ? 'default_domain' : domain;

        message = "Message ID '" + msg_id + "' not found in domain '" + domain + "'";

        Errors.CustomError.call(this, message);
        this.name = "UnknownEntryError";
    };
    Errors.UnknownEntryError.prototype = Errors.CustomError.prototype;
    Errors.UnknownEntryError.prototype.constructor = Errors.CustomError;

    /**
     * Thrown when attempting to load a PO-formatted string from an unknown or invalid adapter
     *
     * @param string mode
     * @constructor
     */
    Errors.UnknownAcquisitionModeError = function (mode) {
        var message;

        mode = !mode ? 'None provided' : mode;
        message = 'PO files acquisition mode: "' + mode + '" is not valid.';

        Errors.CustomError.call(this, message);
        this.name = 'UnknownAcquisitionModeError';
    };
    Errors.UnknownAcquisitionModeError.prototype = Errors.CustomError.prototype;
    Errors.UnknownAcquisitionModeError.prototype.constructor = Errors.CustomError;

    /**
     * Thrown when the FileAdapter cannot read from the file specified for one reason or another

     * @param file
     * @constructor
     */
    Errors.FileReaderError = function (file) {
        var message = 'Adapter cannot read from file: ' + file;
        CustomError.call(this, message);
        this.name = 'FileReaderError';
    };

    Errors.FileReaderError.prototype = Errors.CustomError.prototype;
    Errors.FileReaderError.prototype.constructor = Errors.CustomError;

    /**
     * @author Carlos Vergara
     * @constructor
     */
    var Pomo = function () {
        this.VERSION = '0.1.1'; // Pomo version
        this.domain = 'messages';
        this.returnStrings = false;
        this.unescapeStrings = false;

        var me = this, Adapters = {}, getWaiter, entryExists;

        /**
         * Creates a deferred object taking a callback which will be run as soon as the parser can run it
         *
         * @returns Object
         */
        getWaiter = function () {
            var waiter = {
                /**
                 * This method sets a callback to fire when the messages hash is available
                 * @param callable callback
                 */
                'ready': function (callback) {
                    if (me.waiting) {
                        setTimeout(function () {
                            waiter.ready(callback);
                        }, 20);
                    } else {
                        callback.apply(me, []);
                    }
                }
            };

            return waiter;
        };

        /**
         * "Abstract" Adapter. Just sets the translation domain
         *
         * @param domain
         * @constructor
         */
        Adapters.Base = function (domain) {
            this.toString = function () {
                return '[object Adapter]'
            };
            this.domain = domain;
        };
        Adapters.Base.prototype = {
            loadContents: null
        };

        /**
         * Load the contents of a string into the dictionary
         *
         * @param string literal_string
         * @param domain
         * @constructor
         */
        Adapters.StringAdapter = function (literal_string, domain) {
            Adapters.Base.call(this, domain);
            this.parsed = null;
            this.unparsed = '' + literal_string;
        };
        Adapters.StringAdapter.prototype = {
            loadContents: function () {
                me.waiting = true;
                if (this.parsed === null) {
                    this.parsed = me.Parser.po.parse(this.unparsed, this.domain);
                }
                me.storage.contents = this.parsed;
                me.waiting = false;
            }
        };
        Adapters.StringAdapter.constructor = Adapters.Base;

        if (!isBrowser()) {
            /**
             * Load the contents of a file into the dictionary
             * @param string path_to_file
             * @param domain
             * @constructor
             */
            Adapters.FileAdapter = function (path_to_file, domain) {
                Adapters.Base.call(this, domain);
                this.path = '' + path_to_file;
            };
            Adapters.FileAdapter.prototype = {
                loadContents: function () {
                    me.waiting = true;
                    require('fs').readFile(this.path, 'utf-8', function (err, data) {
                        if (!err) {
                            me.storage.contents = me.Parser.po.parse(data, this.domain);
                            me.waiting = false;
                        }
                        else {
                            throw new Errors.FileReaderError(err.path);
                        }
                    });
                }
            };
        }
        else {
            /**
             * Read all <link> elements with a type="text/x-gettext-translation" into the dictionary
             * @param domain
             * @constructor
             */
            Adapters.LinkAdapter = function (domain) {
                Adapters.Base.call(this, domain);
            };
            Adapters.LinkAdapter.prototype = {
                loadContents: function () {
                    me.waiting = true;
                    var links = document.getElementsByTagName('link'), link, Ajax = Adapters.AjaxAdapter;
                    for (var i = 0, j = links.length; i < j; i++) {
                        link = links[i];
                        if (
                            !!link
                            && !!link.getAttribute('type')
                            && !!link.getAttribute('href')
                            && link.getAttribute('type') === 'text/x-gettext-translation'
                        ) {
                            var adapter = new Ajax(link.getAttribute('href'), this.domain);
                            adapter.loadContents();
                        }
                    }
                }
            };
            Adapters.LinkAdapter.constructor = Adapters.Base;

            /**
             * Read the result of an AJAX call into the dictionary
             * @param url
             * @param domain
             * @constructor
             */
            Adapters.AjaxAdapter = function (url, domain) {
                Adapters.Base.call(this, domain);
                this.url = url;
                /**
                 * Make an AJAX GET request to some source
                 * @param string url
                 * @param callable success
                 * @see http://youmightnotneedjquery.com/#json
                 */
                this.doRequest = function (url, success, error) {
                    var request = new XMLHttpRequest();
                    request.open('GET', url, true);
                    success = !success ? noop : success;
                    error = !error ? noop : error;
                    try{
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
                    catch(Whatever){
                        error.call(error, {error:true});
                    }
                    request = null;
                };
            };
            Adapters.AjaxAdapter.prototype = {
                loadContents: function () {
                    var domain = this.domain;
                    me.waiting = true;
                    this.doRequest(this.url, function (result) {
                        var adapter = new Adapters.StringAdapter(result, domain);
                        adapter.loadContents();
                    });
                }
            };
        }

        /**
         *
         * @param domain
         * @param escaped
         * @returns {boolean}
         */
        entryExists = function (domain, escaped) {
            return !!me.storage && !!me.storage.contents && !!me.storage.contents[domain] && !!me.storage.contents[domain][escaped];
        }


        me.storage = {};
        me.Parser = {};

        /**
         * Defines a PO catalog entry based on the info extracted from a raw catalog entry
         *
         * @param msg
         * @constructor
         */
        me.Parser.Object = function (msg) {
            var phrase_count = 1;
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

                canGetPluralIndex = !this.isPlural && this.plural_forms && this.plural_forms.push && !!me.storage.calculatePluralIndex;
                if (canGetPluralIndex) {
                    var idx = me.storage.calculatePluralIndex(phrase_count);
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
        me.Parser.po = {
            /**
             * Parse a PO-formatted string into a series of catalog entries
             *
             * @param text
             * @param translation_domain
             * @returns Object (a Dictionary with msgid for keys)
             */
            parse: function (text, translation_domain) {
                var getTelltale, extractHeaderInfo, isMultilinePlural, multiLineExtract;
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
                }

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
                            me.storage.calculatePluralIndex = function (phrase_count) {
                                eval(unescapeString(plural_form));
                                if (typeof(plural) === 'undefined') {
                                    plural = 0;
                                }
                                return plural;
                            }
                        }
                    }
                },
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
                    me.storage.header_info = extractHeaderInfo(has_header_info);
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
                        message = new me.Parser.Object(message);
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
         * Wipes out the entirety of the previously loaded contents
         */
        this.wipe = function () {
            me.storage.contents = {};
        };

        /**
         * Load a MO/PO file from somewhere using an adapter
         *
         * @param resource
         * @param options (an object with, at the very least: format -one of 'po' or 'mo'- and mode -one of 'literal','link', or 'ajax') as well as an optional translation_domain key
         * @return waiter
         * @throws Errors.UnknownAcquisitionModeError if options.mode is unknown
         */
        this.load = function (resource, options) {
            options = !options ? {} : options;
            var mode = !!options.mode ? options.mode : false,
                translation_domain = !!options.translation_domain ? options.translation_domain : 'messages',
                adapter;

            //all usable flags are initialized here
            switch (mode) {
                case 'literal':
                    adapter = new Adapters.StringAdapter(resource, translation_domain);
                    break;
                case 'file':
                    adapter = new Adapters.FileAdapter(resource, translation_domain);
                    break;
                case 'link':
                    adapter = new Adapters.LinkAdapter(translation_domain);
                    break;
                case 'ajax':
                    adapter = new Adapters.AjaxAdapter(resource, translation_domain);
                    break;
                default:
                    throw new Errors.UnknownAcquisitionModeError(mode);
                    break;
            }

            adapter.loadContents();

            return getWaiter();
        };

        /**
         * Get a particular translation
         * @param msg_id
         * @param options
         * @return Pomo.Parser.Object|String
         */
        this.getText = function (msg_id, options) {
            msg_id = msg_id.split(/\n/).join('');
            options = !options ? {} : options;

            var variables = !!options.variables ? options.variables : [],
                context = !!options.context ? options.context : false,
                domain = !!options.domain ? options.domain : 'messages',
                count = !!options.count ? options.count : false,
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

            if (entryExists(domain, escaped)) {
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
                throw new Errors.UnknownEntryError(msg_id, domain);
            }
        };

        /**
         * Get the map of loaded msg_ids
         * @returns {}
         */
        this.getMap = function () {
            return me.storage.contents;
        };
    };

    var instance = new Pomo();

    if (typeof (module) !== 'undefined') {
        module.exports = instance;
    }
    else {
        window['Pomo'] = instance;
    }
})(this);