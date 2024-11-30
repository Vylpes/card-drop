describe("constructor", () => {
    test.todo("EXPECT CommandBuilder to be defined");
});

describe("execute", () => {
    describe("GIVEN interaction is not a chat input command", () => {
        test.todo("EXPECT nothing to happen");
    });

    describe("GIVEN subcommand is list", () => {
        test.todo("EXPECT list function to be called");
    });
});

describe("List", () => {
    describe("GIVEN page option is supplied", () => {
        describe("AND page is a valid number", () => {
            test.todo("EXPECT EffectHelper.GenerateEffectEmbed to have been called with page");

            test.todo("EXPECT interaction to have been replied");
        });

        describe("AND page is not a valid number", () => {
            test.todo("EXPECT EffectHelper.GenerateEffectEmbed to have been called with page of 1");
        });
    });

    describe("GIVEN page option is not supplied", () => {
        test.todo("EXPECT EffectHelper.GenerateEffectEmbed to have been called with a page of 1");
    });
});
