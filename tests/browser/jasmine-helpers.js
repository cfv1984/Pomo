beforeEach(function() {
    this.addMatchers({
        toBeInstanceOf: function(entity) {
            return this.actual instanceof entity;
        }
    });
});
