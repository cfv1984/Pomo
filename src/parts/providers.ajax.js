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