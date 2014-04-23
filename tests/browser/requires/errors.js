!function(){
    var req = function(url){
        var parts = ["<scr","ipt s","rc=",'"#URL#"','><','/sc','ript>'];
        document.write(parts.join('').replace('#URL#',url));
    };

    req_many = function(links){
        for(var i in links){
            req(links[i]);
        }
    }

    req_many ([
        '../src/parts/util.js',
        '../src/parts/errors.namespace.js',
        '../src/parts/errors.base.js',
        '../src/parts/errors.custom_error.js',
        '../src/parts/errors.file_reader.js',
        '../src/parts/errors.unknown_entry.js',
        '../src/parts/errors.unknown_provider.js'
    ]);
}();