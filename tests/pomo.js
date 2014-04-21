"use strict";
describe("Pomo tests", function() {
    var Pomo = require('../src/Pomo'),
        literal_conf = {
            format: 'po',
            mode: 'literal',
            translation_domain: 'default_domain'
        },
        file_conf = {
            format: 'po',
            mode: 'file',
            translation_domain: 'default_domain'
        };

    Pomo.domain = 'default_domain';
    Pomo.returnStrings = true;
    Pomo.unescapeStrings = true;

    it("should be able to parse a string literal into a Pomo object", function() {
        Pomo.load('\
        #: /path/to/file.php:110 \n\
        msgctxt "some context" \n\
        msgid "" \n\
        "Multi" \n\
        "Line" \n\
        "msgid" \n\
        msgstr "Una cadena de mensaje" \n\
        \
        ',literal_conf);
        var message = Pomo.getText("Multi\nLine\n\msgid\n",{ domain:'default_domain' });
        expect(message).toBe("Una cadena de mensaje");
    });

    it("should be able to parse a file into a Pomo object", function(){
        Pomo.load(__dirname+'/po/minisample.po', file_conf);
        var message = Pomo.getText("Multi\nLine\n\msgid\n",{ domain:'default_domain' });
        expect(message).toBe("Una cadena de mensaje");
    });

});