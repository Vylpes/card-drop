import Effects from "../../src/commands/effects";

describe("constructor", () => {
    let effects: Effects;

    beforeEach(() => {
        effects = new Effects();
    });

    test("EXPECT CommandBuilder to be defined", () => {
        expect(effects.CommandBuilder).toMatchSnapshot();
    });
});

describe("execute", () => {
    describe("GIVEN interaction is not a chat input command", () => {
        let interaction: any;

        let listSpy: any;

        beforeEach(async () => {
            interaction = {
                isChatInputCommand: jest.fn().mockReturnValue(false),
            };

            const effects = new Effects();

            listSpy = jest.spyOn(effects as any, "List");

            await effects.execute(interaction);
        });

        test("EXPECT isChatInputCommand to have been called", () => {
            expect(interaction.isChatInputCommand).toHaveBeenCalledTimes(1);
        });

        test("EXPECT nothing to happen", () => {
            expect(listSpy).not.toHaveBeenCalled();
        });
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
