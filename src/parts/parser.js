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