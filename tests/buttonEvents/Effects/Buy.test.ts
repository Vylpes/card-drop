import {ButtonInteraction} from "discord.js";
import Buy from "../../../src/buttonEvents/Effects/Buy";
import GenerateButtonInteractionMock from "../../__functions__/discord.js/GenerateButtonInteractionMock";
import { ButtonInteraction as ButtonInteractionType } from "../../__types__/discord.js";
import AppLogger from "../../../src/client/appLogger";

jest.mock("../../../src/client/appLogger");

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

        const confirmSpy = jest.spyOn(Buy as any, "Confirm");

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

        const cancelSpy = jest.spyOn(Buy as any, "Cancel");

        // Act
        await Buy.Execute(interaction as unknown as ButtonInteraction);

        // Assert
        expect(cancelSpy).toHaveBeenCalledTimes(1);
        expect(cancelSpy).toHaveBeenCalledWith(interaction);

        expect(AppLogger.LogError).not.toHaveBeenCalled();
    });

    test("GIVEN subaction is invalid, EXPECT error logged", async () => {
        // Arrange
        interaction.customId += " invalid";

        const confirmSpy = jest.spyOn(Buy as any, "Confirm");
        const cancelSpy = jest.spyOn(Buy as any, "Cancel");

        // Act
        await Buy.Execute(interaction as unknown as ButtonInteraction);

        // Assert
        expect(AppLogger.LogError).toHaveBeenCalledTimes(1);
        expect(AppLogger.LogError).toHaveBeenCalledWith("Buy", "Unknown subaction, effects invalid");

        expect(confirmSpy).not.toHaveBeenCalled();
        expect(cancelSpy).not.toHaveBeenCalled();
    });
});
