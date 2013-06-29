Pomo
=====

  Pomo is a powerful implementation of gettext/dpgettext for Javascript. It both reads PO files into memory and utilizes them
  for internationalization purposes. 
  
  Pomo reads PO files, eventually also MO files, and can load them from AJAX, special <link> tags and literal strings as explained below.
  
  Pomo provides a simplistic interface to work with complex scenarios, being able to handle
    * term contexts (some terms in a given context might very well not mean the same thing in a different context)
	* term plurals
	* multiline msgid and msgstr definitions (except for plurals).
	
  [On this gist](https://gist.github.com/cfv1984/5221069) you'll find a fairly thorough explanation of how to use Pomo, so 
  do please check it out. 
  
  A common use case is aliasing ```Pomo.getText();``` to ```__()```, so [on this other gist](https://gist.github.com/cfv1984/5224082)
  is a 10 lines auto-executing module that does just that, plus complaining if it can't find Pomo. 
  
  Non-evident note: Pomo by default provides a kind of object that can be used as a string, but can be coerced into returning
  strings by setting ```Pomo.returnStrings = true```
  
  For more information, check the [release notes](RELEASE.md)
