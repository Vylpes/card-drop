import {ButtonInteraction} from "discord.js";
import Buy from "../../../src/buttonEvents/Effects/Buy";
import GenerateButtonInteractionMock from "../../__functions__/discord.js/GenerateButtonInteractionMock";
import { ButtonInteraction as ButtonInteractionType } from "../../__types__/discord.js";
import AppLogger from "../../../src/client/appLogger";
import EffectHelper from "../../../src/helpers/EffectHelper";

jest.mock("../../../src/client/appLogger");
jest.mock("../../../src/helpers/EffectHelper");

let interaction: ButtonInteractionType;

beforeEach(() => {
    jest.resetAllMocks();

    interaction = GenerateButtonInteractionMock();
    interaction.customId = "effects buy";

});

describe("Execute", () => {
    test("GIVEN subaction is confirm, EXPECT confirm function executed", async () => {
        // Arrange
        interaction.customId += " confirm";

        const confirmSpy = jest.spyOn(Buy as any, "Confirm")
            .mockImplementation();

        // Act
        await Buy.Execute(interaction as unknown as ButtonInteraction);

        // Assert
        expect(confirmSpy).toHaveBeenCalledTimes(1);
        expect(confirmSpy).toHaveBeenCalledWith(interaction);

        expect(AppLogger.LogError).not.toHaveBeenCalled();
    });

    test("GIVEN subaction is cancel, EXPECT cancel function executed", async () => {
        // Arrange
        interaction.customId += " cancel";

        const cancelSpy = jest.spyOn(Buy as any, "Cancel")
            .mockImplementation();

        // Act
        await Buy.Execute(interaction as unknown as ButtonInteraction);

        // Assert
        expect(cancelSpy).toHaveBeenCalledTimes(1)
        expect(cancelSpy).toHaveBeenCalledWith(interaction);

        expect(AppLogger.LogError).not.toHaveBeenCalled();
    });

    test("GIVEN subaction is invalid, EXPECT error logged", async () => {
        // Arrange
        interaction.customId += " invalid";

        const confirmSpy = jest.spyOn(Buy as any, "Confirm")
            .mockImplementation();
        const cancelSpy = jest.spyOn(Buy as any, "Cancel")
            .mockImplementation();

        // Act
        await Buy.Execute(interaction as unknown as ButtonInteraction);

        // Assert
        expect(AppLogger.LogError).toHaveBeenCalledTimes(1);
        expect(AppLogger.LogError).toHaveBeenCalledWith("Buy", "Unknown subaction, effects invalid");

        expect(confirmSpy).not.toHaveBeenCalled();
        expect(cancelSpy).not.toHaveBeenCalled();
    });
});

describe("Confirm", () => {
    beforeEach(() => {
        interaction.customId += " confirm";
    });

    test("EXPECT success embed generated", async () => {
        // Assert
        interaction.customId += " id 1";

        const embed = {
            id: "embed",
        };
        const row = {
            id: "row",
        };
        
        (EffectHelper.GenerateEffectBuyEmbed as jest.Mock).mockResolvedValue({
            embed,
            row,
        });

        // Act
        await Buy.Execute(interaction as unknown as ButtonInteraction);

        // Assert
        expect(interaction.update).toHaveBeenCalledTimes(1);
        expect(interaction.update).toHaveBeenCalledWith({
            embeds: [ embed ],
            components: [ row ],
        });

        expect(EffectHelper.GenerateEffectBuyEmbed).toHaveBeenCalledTimes(1);
        expect(EffectHelper.GenerateEffectBuyEmbed).toHaveBeenCalledWith("userId", "id", 1, true);

        expect(interaction.reply).not.toHaveBeenCalled();
        expect(AppLogger.LogError).not.toHaveBeenCalled();
    });

    test.todo("GIVEN id is not supplied, EXPECT error");

    test.todo("GIVEN quantity is not supplied, EXPECT error");

    test.todo("GIVEN quantity is not a number, EXPECT error");

    test.todo("GIVEN quantity is 0, EXPECT error");

    test.todo("GIVEN GenerateEffectBuyEmbed returns with a string, EXPECT error replied");
});
