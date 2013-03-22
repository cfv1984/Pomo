!function (win) {
    //see http://www.diveintojavascript.com/projects/javascript-sprintf
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
    //see http://www.diveintojavascript.com/projects/javascript-sprintf
    var vsprintf = function (fmt, argv) {
        argv.unshift(fmt);
        return sprintf.apply(null, argv);
    };

    // see https://code.google.com/p/microajax/
    function microAjax(url, callbackFunction) {
        this.bindFunction = function (caller, object) {
            return function () {
                return caller.apply(object, [object]);
            };
        };

        this.stateChange = function (object) {
            if (this.request.readyState === 4)
                this.callbackFunction(this.request.responseText);
        };

        this.getRequest = function () {
            if (window.ActiveXObject)
                return new ActiveXObject('Microsoft.XMLHTTP');
            else if (window.XMLHttpRequest)
                return new XMLHttpRequest();
            return false;
        };

        this.postBody = (arguments[2] || "");

        this.callbackFunction = callbackFunction;
        this.url = url;
        this.request = this.getRequest();

        if (this.request) {
            var req = this.request;
            req.onreadystatechange = this.bindFunction(this.stateChange, this);

            if (this.postBody !== "") {
                req.open("POST", url, true);
                req.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                req.setRequestHeader('Connection', 'close');
            } else {
                req.open("GET", url, true);
            }

            req.send(this.postBody);
        }
    }

    /**
     Copyright 2013 CFV (http://github.com/cfv1984)

     Licensed under the Apache License, Version 2.0 (the "License");
     you may not use this file except in compliance with the License.
     You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

     Unless required by applicable law or agreed to in writing, software
     distributed under the License is distributed on an "AS IS" BASIS,
     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
     See the License for the specific language governing permissions and
     limitations under the License.
     */
    var Pomo = function () {
        this.VERSION = '0.1.0'; // Pomo version
        this.domain = 'messages';
        this.returnStrings = false;
        this.unescapeStrings = false;

        /**
         * Creates a deferred object taking a callback which will be run as soon as the parser can run it
         * @returns Object
         */
        var getWaiter = function () {
            var waiter = {
                'ready': function (callback) {
                    if (me.waiting) {
                        window.setTimeout(function () {
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
         * Escapes a string in such a way that most whitespace is visible
         * @param val
         * @returns {string|Pomo.Parser.Object}
         */
        var escapeString = function (val) {
            var return_value;
            if (val.constructor != String()) {
                return_value = val;
            }
            if (val.replace) {
                return_value = val.replace(/[\"]/g, '\\"').replace(/[\\]/g, '\\').replace(/[\/]/g, '\/').replace(/[\b]/g, '\\b').replace(/[\f]/g, '\\f').replace(/[\n]/g, '\\n').replace(/[\r]/g, '\\r').replace(/[\t]/g, '\\t');
            }

            return return_value;
        };
        /**
         * Unescapes a string like the output of escapeString()
         * @param val
         * @returns string
         */
        var unescapeString = function (val) {
            var return_value;
            if (!!val.replace) {
                return_value = val.replace("\\n", '\n').replace("\\r", '\r').replace("\\t", '\t').replace("\\f", '\f').replace("\\b", '\b').replace("\\r", '\r');
            }

            return return_value;
        };

        var me = this;
        if (!win.String.prototype.trim) {
            win.String.prototype.trim = function () {
                return this.replace(/^\s+|\s+$/g, '');
            };
        }

        me.storage = {};
        me.Parser = {};

        /**
         * Defines a PO catalog entry based on the info extracted from a raw catalog entry
         * @param msg
         * @constructor
         */
        me.Parser.Object = function (msg) {
            var phrase_count = 1;
            //singular by default
            for (var k in msg) {
                this[k] = msg[k];
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
                var return_value;
                if (!this.isPlural) {
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
         * @type {{parse: Function, generate: Function}}
         */
        me.Parser.po = {
            /**
             * Parse a PO-formatted string into a series of catalog entries
             * @param text
             * @param translation_domain
             * @returns Object (a Dictionary with msgid for keys
             */
            parse: function (text, translation_domain) {
                var getTelltale = function (str) {
                    return str.substring(0, 12).split(' ')[0].trim();
                };
                var extract_header_info = function (header) {
                    var header_lines = header.split("\n");
                    for (var i = 0, j = header_lines.length; i < j; i++) {
                        if (header_lines[i].indexOf('"Plural-Forms: nplurals') === 0) {//parse plural forms
                            var plural_form = header_lines[i].substring(14).slice(0, -1);
                            me.storage.calculatePluralIndex = function (n) {
                                eval(unescapeString(plural_form));
                                if(typeof(plural) === 'undefined'){
                                    plural = 0;
                                }
                                return plural;
                            }
                        }
                    }
                };

                var parsed = {};
                var has_header_info;
                var header_info;
                var part;
                var domain = ( typeof (translation_domain) === 'undefined') ? 'messages' : translation_domain;
                var parts = [];
                var counter = 0;
                text = text.replace(/\r\n|\r/g, "\n");
                parsed[domain] = {};
                parts = text.split(/\n\n/);

                header_info = parts.shift();
                has_header_info = extract_header_info(header_info);

                if (!has_header_info) {
                    parts.unshift(header_info);
                } else {
                    me.storage.header_info = extract_header_info(has_header_info);
                }

                while (part = parts.shift()) {
                    var message = {};
                    var part_lines = !!part ? part.split(/\n/) : [];
                    var line = '';
                    while (line = part_lines.shift()) {
                        line = line.trim();
                        var next_line = part_lines.slice(0, -1)[0];
                        var line_telltale = getTelltale(line);
                        var next_line_telltale = next_line ? getTelltale(next_line) : false;
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
                                        var msgid_buf = [];
                                        while (possible = part_lines.shift()) {
                                            possible = possible.trim();
                                            if (possible.indexOf('"') === 0) {
                                                msgid_buf.push(possible.substring(1).slice(0, -1));
                                            } else {
                                                part_lines.unshift(possible);
                                                break;
                                            }
                                        }
                                        message.id = msgid_buf.join('');
                                    }
                                } else {
                                    if (next_line_telltale = 'msgstr') {
                                        message.id = line.substr(7).slice(0, -1);
                                    }
                                }
                                continue;
                                break;
                            case 'msgstr':
                                if (line.indexOf('msgstr ""') === 0) {
                                    var msgstr_buf = [];
                                    while (possible = part_lines.shift()) {
                                        possible = possible.trim();
                                        if (possible.indexOf('"') === 0) {
                                            msgstr_buf.push(possible.substr(1).slice(0, -1));
                                        } else {
                                            part_lines.unshift(possible);
                                            break;
                                        }
                                    }
                                    message.translation = msgstr_buf.join('');

                                } else {
                                    message.translation = line.substr(8).slice(0, -1);
                                }
                                break;
                            case '#:':
                            case '#.':
                            case '#':
                                continue;
                            break;
                            case '#,':
                                //flag
                                break;
                            default:
                                if (!!line && line.match(/msgstr\[[0-9]\]/)) {//is a multiple plural forms case
                                    var cases = [];
                                    while (!!line && line.match(/msgstr\[[0-9]\]/)) {
                                        cases.push(line.substring(10).slice(0, -1));
                                        line = part_lines.shift();
                                    }
                                    message.plural_forms = cases;
                                    message.translation = cases[0];
                                }
                                continue;
                                break;
                        }
                    }

                    if (!!message.id && !!message.translation) {
                        message = new me.Parser.Object(message);
                        if (!parsed[domain][message.id]) {
                            parsed[domain][escapeString(message.id)] = [message];
                        } else {
                            parsed[domain][escapeString(message.id)].push(message);
                        }
                    }
                    counter++;
                }

                return parsed;
            },
            generate: function () {
                throw "Feature unimplemented";
            }
        };
        /**
         * Internal function to parse literalsources.
         */
        var loadInternal = function(resource, format, translation_domain) {
            this.waiting = true;
            //this one is a busy wait, but you never know
            switch (format) {
                case 'po':
                    var contents = me.Parser.po.parse(resource, translation_domain);
                    break;
                default:
                case 'mo':
                    throw "Unimplemented format";
                    break;
            }
            this.waiting = false;
            me.storage.contents = contents;
        };

        /**
         * Internal function to parse sources from a <link>.
         * @
         */
        var loadByLink = function (resource, format, translation_domain) {
            var result;
            var link = document.getElementById(resource);
            if (!!link && !!link.type && link.type === 'text/x-gettext-translation') {
                result = loadByAjax(link.href, format, translation_domain);
            }

            return result;
        };

        var loadByAjax = function (resource, format, translation_domain) {
            me.waiting = true;
            var contents = microAjax(resource, function (result) {
                me.waiting = false;
                return loadInternal(result, format, translation_domain);
            });

            return contents;
        };

        /**
         * Moves window.Pomo out of the way and returns itself
         * return Pomo
         */
        this.noConflict = function () {
            win.__Pomo = win.Pomo;
            delete win['Pomo'];
            return win.__Pomo;
        };
        /**
         * Load a MO/PO file from somewhere
         * @param resource
         * @param options (an object with, at the very least: format -one of 'po' or 'mo'- and mode -one of 'literal','link', or 'ajax') as well as an optional translation_domain key
         * @return waiter
         */
        this.load = function (resource, options) {
            options = !options ? {} : options;
            var format = !!options.format ? options.format : false;
            var mode = !!options.mode ? options.mode : false;
            var translation_domain = !!options.translation_domain ? options.translation_domain : 'messages';

            //all usable flags are initialized here
            switch (mode) {
                case 'literal':
                    loadInternal(resource, format, translation_domain);
                    break;
                case 'link':
                    loadByLink(resource, format, translation_domain);
                    break;
                case 'ajax':
                    loadByAjax(resource, format, translation_domain);
                    break;
                default:
                    throw "specify a " + format + " files acquisition mode";
                    break;
            }

            return getWaiter();
        };
        /**
         * Get a particular translation
         * @param msg_id
         * @param options
         * @return Pomo.Parser.Object|String
         */
        this.getText = function (msg_id, options) {
            options = !options ? {} : options;
            var variables = !!options.variables ? options.variables : [];
            var context = !!options.context ? options.context : false;
            var domain = !!options.domain ? options.domain : 'messages';
            var count = !!options.count ? options.count : false;

            var escaped = escapeString(msg_id);

            if (!domain && !me.domain) {
                domain = 'messages';
            } else {
                if (!!me.domain) {
                    domain = me.domain;
                }
            }
            if (!!me.storage.contents[domain] && !!me.storage.contents[domain][escaped]) {
                var entry = me.storage.contents[domain][escaped];
                if (!!context) {
                    for (var i = 0, j = me.storage.contents[domain][escaped].length; i < j; i++) {

                        if (entry.context && entry.context === context) {
                            translation = me.storage.contents[domain][escaped][i];
                            break;
                        }
                    }
                }
                if (!!me.storage.contents[domain][escaped].unshift) {
                    entry = me.storage.contents[domain][escaped][0];
                }
                var translation = entry;

                if (!!count) {
                    entry.setCount(count);
                }

                var is_bare_string = (entry.constructor === String());
                if (me.returnStrings) {
                    translation = entry.toString();
                }
                if (!!variables) {
                    var bare_string = is_bare_string ? translation : translation.translation;
                    var translated = vsprintf(bare_string, variables);
                    if (!is_bare_string) {
                        translation.translation = translated;
                    } else {
                        translation = translated;
                    }
                }

                if (is_bare_string && me.unescapeStrings) {
                    translation = unescapeString(translation);
                } else if (me.unescapeStrings && !is_bare_string) {
                    translation.translation = unescapeString(translation.translation);
                }

                return translation;
            } else {
                throw "Unknown id " + msgid;
            }
        };


        this.getMap = function () {
            return me.storage.contents;
        };
    };
    win.Pomo = new Pomo();
}(window, document);
