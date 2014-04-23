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