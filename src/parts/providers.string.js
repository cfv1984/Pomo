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