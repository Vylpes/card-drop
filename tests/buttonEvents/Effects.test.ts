import {ButtonInteraction} from "discord.js";
import Effects from "../../src/buttonEvents/Effects";
import EffectHelper from "../../src/helpers/EffectHelper";

describe("execute", () => {
    describe("GIVEN action in custom id is list", () => {
        let interaction = {
            customId: "effects list",
        } as unknown as ButtonInteraction;

        let listSpy: any;

        beforeAll(async () => {
            const effects = new Effects();

            listSpy = jest.spyOn(effects as any, "List")
                .mockImplementation(() => {});

            await effects.execute(interaction);
        });

        test("EXPECT list function to be called", () => {
            expect(listSpy).toHaveBeenCalledTimes(1);
            expect(listSpy).toHaveBeenCalledWith(interaction);
        });
    });
});

describe("List", () => {
    let interaction: any;

    const embed = {
        name: "Embed",
    };

    const row = {
        name: "Row",
    };

    beforeEach(() => {
        interaction = {
            customId: "effects list",
            user: {
                id: "userId",
            },
            update: jest.fn(),
            reply: jest.fn(),
        };
    });

    describe("GIVEN page is a valid number", () => {
        beforeEach(async () => {
            interaction.customId += " 1";

            EffectHelper.GenerateEffectEmbed = jest.fn()
                .mockResolvedValue({
                    embed,
                    row,
                });

            const effects = new Effects();

            await effects.execute(interaction);
        });

        test("EXPECT EffectHelper.GenerateEffectEmbed to be called", () => {
            expect(EffectHelper.GenerateEffectEmbed).toHaveBeenCalledTimes(1);
            expect(EffectHelper.GenerateEffectEmbed).toHaveBeenCalledWith("userId", 1);
        });

        test("EXPECT interaction to be updated", () => {
            expect(interaction.update).toHaveBeenCalledTimes(1);
            expect(interaction.update).toHaveBeenCalledWith({
                embeds: [ embed ],
                components: [ row ],
            });
        });
    });

    describe("GIVEN page in custom id is not supplied", () => {
        beforeEach(async () => {
            EffectHelper.GenerateEffectEmbed = jest.fn()
                .mockResolvedValue({
                    embed,
                    row,
                });

            const effects = new Effects();

            await effects.execute(interaction);
        });

        test("EXPECT interaction to be replied with error", () => {
            expect(interaction.reply).toHaveBeenCalledTimes(1);
            expect(interaction.reply).toHaveBeenCalledWith("Page option is not a valid number");
        });

        test("EXPECT interaction to not be updated", () => {
            expect(interaction.update).not.toHaveBeenCalled();
        });
    });

    describe("GIVEN page in custom id is not a number", () => {
        beforeEach(async () => {
            interaction.customId += " test";

            EffectHelper.GenerateEffectEmbed = jest.fn()
                .mockResolvedValue({
                    embed,
                    row,
                });

            const effects = new Effects();

            await effects.execute(interaction);
        });

        test("EXPECT interaction to be replied with error", () => {
            expect(interaction.reply).toHaveBeenCalledTimes(1);
            expect(interaction.reply).toHaveBeenCalledWith("Page option is not a valid number");
        });

        test("EXPECT interaction to not be updated", () => {
            expect(interaction.update).not.toHaveBeenCalled();
        });
    });
});
