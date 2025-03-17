import { ButtonInteraction } from "discord.js";
import Effects from "../../src/buttonEvents/Effects";
import GenerateButtonInteractionMock from "../__functions__/discord.js/GenerateButtonInteractionMock";
import { ButtonInteraction as ButtonInteractionType } from "../__types__/discord.js";
import List from "../../src/buttonEvents/Effects/List";
import Use from "../../src/buttonEvents/Effects/Use";
import AppLogger from "../../src/client/appLogger";

jest.mock("../../src/client/appLogger");
jest.mock("../../src/buttonEvents/Effects/List");
jest.mock("../../src/buttonEvents/Effects/Use");

let interaction: ButtonInteractionType;

beforeEach(() => {
    jest.resetAllMocks();

    interaction = GenerateButtonInteractionMock();
    interaction.customId = "effects";
});

test("GIVEN action is list, EXPECT list function to be called", async () => {
    // Arrange
    interaction.customId = "effects list";

    // Act
    const effects = new Effects();
    await effects.execute(interaction as unknown as ButtonInteraction);

    // Assert
    expect(List).toHaveBeenCalledTimes(1);
    expect(List).toHaveBeenCalledWith(interaction);

    expect(Use.Execute).not.toHaveBeenCalled();
});

test("GIVEN action is use, EXPECT use function to be called", async () => {
    // Arrange
    interaction.customId = "effects use";

    // Act
    const effects = new Effects();
    await effects.execute(interaction as unknown as ButtonInteraction);

    // Assert
    expect(Use.Execute).toHaveBeenCalledTimes(1);
    expect(Use.Execute).toHaveBeenCalledWith(interaction);

    expect(List).not.toHaveBeenCalled();
});

test.todo("GIVEN action is buy, EXPECT buy function to be called");

test("GIVEN action is invalid, EXPECT nothing to be called", async () => {
    // Arrange
    interaction.customId = "effects invalid";

    // Act
    const effects = new Effects();
    await effects.execute(interaction as unknown as ButtonInteraction);

    // Assert
    expect(List).not.toHaveBeenCalled();
    expect(Use.Execute).not.toHaveBeenCalled();

    expect(AppLogger.LogError).toHaveBeenCalledTimes(1);
    expect(AppLogger.LogError).toHaveBeenCalledWith("Buttons/Effects", "Unknown action, invalid");
});
