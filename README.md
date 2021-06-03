Pomo
=====

  Pomo is a powerful implementation of gettext/dpgettext for Javascript that can be run both in the browser and Node as-is.
  It both reads PO files into memory and utilizes them  for internationalization purposes.
  
  Pomo reads PO files, eventually also MO files, and can load them from AJAX, special <link> tags and literal strings as explained below.
  
  Pomo provides a simplistic interface to work with complex scenarios, being able to handle
    * term contexts (some terms in a given context might very well not mean the same thing in a different context)
	* term plurals
	* multiline msgid and msgstr definitions (except for plurals).

  
  For more information, check the [release notes](RELEASE.md)

Usage example
-------

```Javascript
//Browser example. Server would have it the same, just after calling Pomo = require('./pomo.js')
window.onload = function() {
    /*
    Set a default domain for the Pomo.getText calls. If omitted,
    all calls to getText need to pass the domain set on Pomo.load,
    unless none was passed, in which case getText doesn't require a domain
  */
    Pomo.domain = 'translation_domain';

    //return a plain string instead of a translation object
    Pomo.returnStrings = true;

    //Return unescaped strings ready for insertion instead of the original literal escaped string
    Pomo.unescapeStrings = true;

    //Let's load from a literal
    Pomo.load('\
        #: /path/to/file.php:110 \
        msgctxt "some context" \
        msgid "String to translate, with %s markers" \
        msgstr "Cadena a traducir, con marcadores de %s" \
    ', //the literal PO contents
    {
        format: 'po', // the file format, can potentially be 'po' or 'mo'
        mode: 'literal', // wether the passed resource is a 'literal', a 'link' or a 'remote' file
        translation_domain: 'translation_domain' //Loaded resources will be put under this domain if set.
    });

    var p = document.createElement('p');
    p.appendChild(
    document.createTextNode(
    Pomo.getText("String to translate, with %s markers", {
        variables: ["tipo printf"], //only needed if you pass markers
        context: 'optional context',
        /* if there is a context, a search is made
                             for the translation mapping to it               */
        domain: 'translation_domain'
        /* Only mandatory if there's an actual domain in use
                                and no default one was set via Pomo.domain */
    })));
    document.documentElement.appendChild(p);

    //now let's load from any amounts of <link type="text/x-gettext-translation"/> you might have on the page
    var lnk_deferred = Pomo.load(null, {
        format: 'po',
        mode: 'link', //the new mode, tells Pomo to find a <link id="%LINK_ELEMENT_NAME%" and fetch it
        translation_domain: 'entirely_different_translation_domain' //this one we'll put in another translation_domain
    });

    /*
    Pomo.load now returns a Deferred object, which can execute the
    passed function upon parsing all the remote data. The passed function will have this = the Pomo instance
  */
    lnk_deferred.ready(function() {
        var p = document.createElement('p');
        p.appendChild(
        document.createTextNode(
        this.getText("String to translate, with %s markers", {
            variables: ["printf-ish"],
            context: 'optional context',
            domain: 'entirely_different_translation_domain'
        })));

        document.documentElement.appendChild(p);
    });

    /*
    And now another translation_domain from a straight AJAX call
  */
    var ajax_deferred = Pomo.load('/ajax/valid/url', {
        format: 'po',
        mode: 'ajax',
        translation_domain: 'a_third_translation_domain'
    });

    /*
    The deferred object works exactly the same way, only this time we're making use of the last loaded domain.
  */
    ajax_deferred.ready(function() {
        var p = document.createElement('p');
        p.appendChild(
        document.createTextNode(
        this.getText("String to translate, with %s markers", {
            variables: ["printf-ish"],
            context: 'optional context',
            domain: 'a_third_translation_domain'
        })));

        document.documentElement.appendChild(p);
    });
};
```

  A pretty thing to do is aliasing ```Pomo.getText();``` to ```__()```, like this:.

```Javascript
var __ = (function(){
  var _ = !!window.Pomo? window.Pomo : (!!window.__Pomo? window.__Pomo: false); //is Pomo there? get it
  var gettext_wrap = function(word, options){return _.getText(word, options)};  // aliases getText
  gettext_wrap = !!_? gettext_wrap: false; //if Pomo can be found, alias it
  if(!gettext_wrap){
    throw new "Pomo can't be found";
  }

  return gettext_wrap;
})();
```

  Non-evident note: Pomo by default provides a kind of object that can be used as a string, but can be coerced into returning
  strings by setting ```Pomo.returnStrings = true```
