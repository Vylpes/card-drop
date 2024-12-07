import {ChatInputCommandInteraction} from "discord.js";
import Effects from "../../src/commands/effects";
import EffectHelper from "../../src/helpers/EffectHelper";

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
        let interaction: ChatInputCommandInteraction;

        let listSpy: jest.SpyInstance;

        beforeEach(async () => {
            interaction = {
                isChatInputCommand: jest.fn().mockReturnValue(false),
            } as unknown as ChatInputCommandInteraction;

            const effects = new Effects();

            listSpy = jest.spyOn(effects as unknown as {"List": () => object}, "List")
                .mockImplementation();

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
        let interaction: ChatInputCommandInteraction;

        let listSpy: jest.SpyInstance;

        beforeEach(async () => {
            interaction = {
                isChatInputCommand: jest.fn().mockReturnValue(true),
                options: {
                    getSubcommand: jest.fn().mockReturnValue("list"),
                },
            } as unknown as ChatInputCommandInteraction;

            const effects = new Effects();

            listSpy = jest.spyOn(effects as unknown as {"List": () => object}, "List")
                .mockImplementation();

            await effects.execute(interaction);
        });

        test("EXPECT subcommand function to be called", () => {
            expect(interaction.options.getSubcommand).toHaveBeenCalledTimes(1);
        });

        test("EXPECT list function to be called", () => {
            expect(listSpy).toHaveBeenCalledTimes(1);
            expect(listSpy).toHaveBeenCalledWith(interaction);
        });
    });
});

describe("List", () => {
   const effects: Effects = new Effects(); 
   let interaction: ChatInputCommandInteraction;

   const embed = {
       name: "embed",
   };

   const row = {
       name: "row",
   };

  beforeEach(async () => {
       interaction = {
           isChatInputCommand: jest.fn().mockReturnValue(true),
           options: {
               getSubcommand: jest.fn().mockReturnValue("list"),
           },
           reply: jest.fn(),
           user: {
               id: "userId",
           },
       } as unknown as ChatInputCommandInteraction;

       const effects = new Effects();

       EffectHelper.GenerateEffectEmbed = jest.fn().mockReturnValue({
           embed,
           row,
       });

       jest.spyOn(effects as unknown as {"List": () => object}, "List")
           .mockImplementation();
   });

    describe("GIVEN page option is supplied", () => {
        describe("AND page is a valid number", () => {
            beforeEach(async () => {
                interaction.options.get = jest.fn().mockReturnValueOnce({
                    value: "2",
                });

                await effects.execute(interaction);
            });

            test("EXPECT EffectHelper.GenerateEffectEmbed to have been called with page", () => {
                expect(EffectHelper.GenerateEffectEmbed).toHaveBeenCalledTimes(1);
                expect(EffectHelper.GenerateEffectEmbed).toHaveBeenCalledWith("userId", 2);
            });

            test("EXPECT interaction to have been replied", () => {
                expect(interaction.reply).toHaveBeenCalledTimes(1);
                expect(interaction.reply).toHaveBeenCalledWith({
                    embeds: [ embed ],
                    components: [ row ],
                });
            });
        });

        describe("AND page is not a valid number", () => {
            beforeEach(async () => {
                interaction.options.get = jest.fn().mockReturnValueOnce({
                    value: "test",
                });

                await effects.execute(interaction);
            });

            test("EXPECT EffectHelper.GenerateEffectEmbed to have been called with page of 1", () => {
                expect(EffectHelper.GenerateEffectEmbed).toHaveBeenCalledTimes(1);
                expect(EffectHelper.GenerateEffectEmbed).toHaveBeenCalledWith("userId", 1);
            });
        });
    });

    describe("GIVEN page option is not supplied", () => {
        beforeEach(async () => {
           interaction.options.get = jest.fn().mockReturnValueOnce(undefined);

           await effects.execute(interaction);
       });

       test("EXPECT EffectHelper.GenerateEffectEmbed to have been called with page of 1", () => {
           expect(EffectHelper.GenerateEffectEmbed).toHaveBeenCalledTimes(1);
           expect(EffectHelper.GenerateEffectEmbed).toHaveBeenCalledWith("userId", 1);
       });
    });
});
