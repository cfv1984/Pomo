!function(){
    var req = function(url){
        var parts = ["<scr","ipt s","rc=",'"#URL#"','><','/sc','ript>'];
        document.write(parts.join('').replace('#URL#',url));
    };
    var req_many = function(links){
        for(var i in links){
            req(links[i]);
        }
    }

    req_many ([
        '../src/parts/util.js',
        '../src/parts/providers.namespace.js',
        '../src/parts/providers.base.js',
        '../src/parts/providers.string.js',
        '../src/parts/providers.ajax.js',
        '../src/parts/providers.links.js',
        '../src/parts/parser.js'
    ]);
}();