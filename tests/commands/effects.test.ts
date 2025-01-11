describe("constructor", () => {
    test.todo("EXPECT CommandBuilder to be defined");
});

describe("execute", () => {
    test.todo("GIVEN interaction is NOT a ChatInputCommand, EXPECT nothing to happen");

    test.todo("GIVEN subcommand is list, EXPECT list function to be called");

    test.todo("GIVEN subcommand is use, EXPECT use function to be called");
});

describe("List", () => {
    test.todo("GIVEN pageOption is null, EXPECT page to default to 0");

    test.todo("GIVEN pageOption.value is undefined, EXPECT page to default to 0");

    test.todo("EXPECT interaction to be replied");
});

describe("Use", () => {
    test.todo("GIVEN effectDetail is not found, EXPECT error");

    test.todo("GIVEN user can not use effect, EXPECT error");

    test.todo("EXPECT interaction to be replied");
});