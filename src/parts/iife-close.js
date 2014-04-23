instance = new Pomo();
if (typeof (module) !== 'undefined') {
    module.exports = instance;
}
else {
    window['Pomo'] = instance;
}
})(this);