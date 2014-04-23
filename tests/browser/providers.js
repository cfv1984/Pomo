describe("The Pomo Data Providers", function(){
    var async = new AsyncSpec(this);

    var small_po_literal = '\
        #: /path/to/file.php:110 \n\
        msgctxt "some context" \n\
        msgid "" \n\
        "Multi" \n\
        "Line" \n\
        "msgid" \n\
        msgstr "Una cadena de mensaje" \n\
    ';

    it("Have a common ancestor", function(){
        var string_provider = new Providers.String();
        var ajax_provider = new Providers.Ajax();
        var link_provider = new Providers.Links();

        expect(string_provider).toBeInstanceOf(Providers.Base);
        expect(ajax_provider).toBeInstanceOf(Providers.Base);
        expect(link_provider).toBeInstanceOf(Providers.Base);
    });

    it("All implement getContents", function(){
        var string_provider = new Providers.String();
        var ajax_provider = new Providers.Ajax();
        var link_provider = new Providers.Links();
        expect(string_provider.getContents).toBeDefined()
        expect(ajax_provider.getContents).toBeDefined()
        expect(link_provider.getContents).toBeDefined()
    });
    async.it("The String provider reads in the browser too", function(done){
        var string_provider = new Providers.String(small_po_literal,'example');
        string_provider.done(function(contents){
            expect(contents.example.MultiLinemsgid).toBeDefined();
            done();
        });
        string_provider.getContents();
    });
    async.it("The AJAX provider makes an async request for a datum", function(done){
        var ajax = new Providers.Ajax('po/minisample.po','example');
        ajax.done(function(contents){
            expect(contents.example.MultiLinemsgid).toBeDefined();
            done();
        });
        ajax.getContents();
    });

    async.it("The Links provider makes an async request for each link it finds", function(done){
        var links = new Providers.Links('example'), count = 0;
        links.done(function(contents){
            expect(contents.example).toBeDefined();
            var item;
            if(contents.example['60%']){
                item = contents.example['60%'][0];
            }
            else{
                item = contents.example.MultiLinemsgid[0];
            }
            expect(item.setCount).toBeDefined();
            count+=1;
        });
        var itv = setInterval(function(){
            if(count === 2){
                done();
            }
        },48);
        links.getContents();
    });
});