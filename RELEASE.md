Pomo 0.1.1 Release notes
=============

  This page documents all the new features, enhancements and visible changes included in the Pomo release.

  For detailed information on any of Pomo's features, please refer to the [readme](README.md)

Requirements
-------------

  * Pomo requires the latest version of Chrome or Firefox as it has only been tested in them, so
  to err in the side of caution any of them is a requirement
  * As of this version it is also capable of running under the latest Node.JS install

Known Bugs
----------

  * Pomo does not handle multiline plural definitions, so something like
```
    msgstr[0] ""
    msgstr[0] "This is a"
    msgstr[0] "Multiline example"
    msgstr[0] "That is unsupported
```

is going to be discarded by Pomo, and causes an awkward situation where the resulting translation might or might
not me parsed. Please check you don't have any of these.




Pomo 0.1 Release notes
=============

  This page documents all the new features, enhancements and visible changes included in the Pomo release.
  
  For detailed information on any of Pomo's features, please refer to the [readme](README.md)

Requirements
-------------
  
  * Pomo requires the latest version of Chrome or Firefox as it has only been tested in them, so 
  to err in the side of caution any of them is a requirement
  
Known Bugs
----------

  * Pomo does not handle multiline plural definitions, so something like
```
    msgstr[0] ""
    msgstr[0] "This is a"
    msgstr[0] "Multiline example"
    msgstr[0] "That is unsupported
```

is going to be discarded by Pomo, and causes an awkward situation where the resulting translation might or might
not me parsed. Please check you don't have any of these. 