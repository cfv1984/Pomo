describe("The Pomo Error primitives", function(){
    it("Have a common ancestor", function(){
        var bad_entry = new Errors.UnknownEntryError();
        var bad_file = new Errors.FileReaderError();
        var bad_provider = new Errors.UnknownAcquisitionModeError();

        expect(bad_entry).toBeInstanceOf(Errors.CustomError);
        expect(bad_entry).toBeInstanceOf(Errors.Base);
        expect(bad_file).toBeInstanceOf(Errors.CustomError);
        expect(bad_file).toBeInstanceOf(Errors.Base);
        expect(bad_provider).toBeInstanceOf(Errors.CustomError);
        expect(bad_provider).toBeInstanceOf(Errors.Base);
        expect(bad_entry).toBeInstanceOf(Error);
        expect(bad_file).toBeInstanceOf(Error);
        expect(bad_provider).toBeInstanceOf(Error);
    });
});