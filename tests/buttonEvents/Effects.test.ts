import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, EmbedBuilder } from "discord.js";
import Effects from "../../src/buttonEvents/Effects";
import EffectHelper from "../../src/helpers/EffectHelper";
import { EffectDetails } from "../../src/constants/EffectDetails";
import TimeLengthInput from "../../src/helpers/TimeLengthInput";

describe("Effects", () => {
    let interaction: ButtonInteraction;
    let effects: Effects;

    beforeEach(() => {
        interaction = {
            customId: "effects list 1",
            user: { id: "123" },
            reply: jest.fn(),
            update: jest.fn(),
        } as unknown as ButtonInteraction;
        effects = new Effects();
    });

    it("should call List method when action is 'list'", async () => {
        const listSpy = jest.spyOn(effects, "List").mockImplementation(async () => {});

        await effects.execute(interaction);

        expect(listSpy).toHaveBeenCalledWith(interaction);
    });

    it("should call Use method when action is 'use'", async () => {
        interaction.customId = "effects use confirm 1";
        const useSpy = jest.spyOn(effects, "Use").mockImplementation(async () => {});

        await effects.execute(interaction);

        expect(useSpy).toHaveBeenCalledWith(interaction);
    });

    it("should reply with error message when page option is not a valid number", async () => {
        interaction.customId = "effects list invalid";
        await effects.execute(interaction);

        expect(interaction.reply).toHaveBeenCalledWith("Page option is not a valid number");
    });

    it("should update interaction with generated embed and row", async () => {
        const mockEmbed = {
            embed: new EmbedBuilder(),
            row: new ActionRowBuilder<ButtonBuilder>()
        };

        jest.spyOn(EffectHelper, "GenerateEffectEmbed").mockResolvedValue(mockEmbed);

        await effects.List(interaction);

        expect(interaction.update).toHaveBeenCalledWith({
            embeds: [mockEmbed.embed],
            components: [mockEmbed.row],
        });
    });

    it("should call UseConfirm method when subaction is 'confirm'", async () => {
        interaction.customId = "effects use confirm 1";
        const useConfirmSpy = jest.spyOn(effects, "UseConfirm").mockImplementation(async () => {});

        await effects.Use(interaction);

        expect(useConfirmSpy).toHaveBeenCalledWith(interaction);
    });

    it("should call UseCancel method when subaction is 'cancel'", async () => {
        interaction.customId = "effects use cancel 1";
        const useCancelSpy = jest.spyOn(effects, "UseCancel").mockImplementation(async () => {});

        await effects.Use(interaction);

        expect(useCancelSpy).toHaveBeenCalledWith(interaction);
    });

    it("should reply with error message when effect detail is not found in UseConfirm", async () => {
        interaction.customId = "effects use confirm invalid";
        await effects.UseConfirm(interaction);

        expect(interaction.reply).toHaveBeenCalledWith("Effect not found in system!");
    });

    it("should reply with error message when effect detail is not found in UseCancel", async () => {
        interaction.customId = "effects use cancel invalid";
        await effects.UseCancel(interaction);

        expect(interaction.reply).toHaveBeenCalledWith("Effect not found in system!");
    });

    it("should update interaction with embed and row when effect is used successfully", async () => {
        const mockEffectDetail = { id: "1", friendlyName: "Test Effect", duration: 1000, cost: 10, cooldown: 5000 };
        const mockResult = true;

        jest.spyOn(EffectDetails, "get").mockReturnValue(mockEffectDetail);
        jest.spyOn(EffectHelper, "UseEffect").mockResolvedValue(mockResult);

        await effects.UseConfirm(interaction);

        expect(interaction.update).toHaveBeenCalledWith(expect.objectContaining({
            embeds: expect.any(Array),
            components: expect.any(Array),
        }));
    });

    it("should reply with error message when effect is not used successfully", async () => {
        const mockEffectDetail = { id: "1", friendlyName: "Test Effect", duration: 1000, cost: 0, cooldown: 0 };
        const mockResult = false;

        jest.spyOn(EffectDetails, "get").mockReturnValue(mockEffectDetail);
        jest.spyOn(EffectHelper, "UseEffect").mockResolvedValue(mockResult);

        await effects.UseConfirm(interaction);

        expect(interaction.reply).toHaveBeenCalledWith("Unable to use effect! Please make sure you have it in your inventory and is not on cooldown");
    });

    it("should update interaction with embed and row when effect use is cancelled", async () => {
        const mockEffectDetail = { id: "1", friendlyName: "Test Effect", duration: 1000, cost: 0, cooldown: 0 };

        jest.spyOn(EffectDetails, "get").mockReturnValue(mockEffectDetail);
        jest.spyOn(TimeLengthInput, "ConvertFromMilliseconds").mockReturnValue({
            GetLengthShort: () => "1s",
        } as TimeLengthInput);

        await effects.UseCancel(interaction);

        expect(interaction.update).toHaveBeenCalledWith(expect.objectContaining({
            embeds: expect.any(Array),
            components: expect.any(Array),
        }));
    });
});