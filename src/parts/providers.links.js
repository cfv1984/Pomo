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