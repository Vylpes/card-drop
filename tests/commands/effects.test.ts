import Effects from "../../src/commands/effects";
import List from "../../src/commands/effects/List";
import Use from "../../src/commands/effects/Use";
import Buy from "../../src/commands/effects/Buy";
import AppLogger from "../../src/client/appLogger";
import GenerateCommandInteractionMock from "../__functions__/discord.js/GenerateCommandInteractionMock";
import { CommandInteraction } from "discord.js";

jest.mock("../../src/commands/effects/List");
jest.mock("../../src/commands/effects/Use");
jest.mock("../../src/commands/effects/Buy");
jest.mock("../../src/client/appLogger");

beforeEach(() => {
    jest.resetAllMocks();
});

test("EXPECT CommandBuilder to be defined", async () => {
    // Act
    const effects = new Effects();

    // Assert
    expect(effects.CommandBuilder).toMatchSnapshot();
});

describe("execute", () => {
    test("GIVEN interaction subcommand is list, EXPECT buy function called", async () => {
        // Arrange
        const interaction = GenerateCommandInteractionMock({
            subcommand: "list",
        });

        // Act
        const effects = new Effects();
        await effects.execute(interaction as unknown as CommandInteraction);

        // Assert
        expect(List).toHaveBeenCalledTimes(1);
        expect(List).toHaveBeenCalledWith(interaction);

        expect(Use).not.toHaveBeenCalled();
        expect(Buy).not.toHaveBeenCalled();

        expect(AppLogger.LogError).not.toHaveBeenCalled();
    });

    test("GIVEN interaction subcommand is use, EXPECT buy function called", async () => {
        // Arrange
        const interaction = GenerateCommandInteractionMock({
            subcommand: "use",
        });

        // Act
        const effects = new Effects();
        await effects.execute(interaction as unknown as CommandInteraction);

        // Assert
        expect(Use).toHaveBeenCalledTimes(1);
        expect(Use).toHaveBeenCalledWith(interaction);

        expect(List).not.toHaveBeenCalled();
        expect(Buy).not.toHaveBeenCalled();

        expect(AppLogger.LogError).not.toHaveBeenCalled();
    });

    test("GIVEN interaction subcommand is buy, EXPECT buy function called", async () => {
        // Arrange
        const interaction = GenerateCommandInteractionMock({
            subcommand: "buy",
        });

        // Act
        const effects = new Effects();
        await effects.execute(interaction as unknown as CommandInteraction);

        // Assert
        expect(Buy).toHaveBeenCalledTimes(1);
        expect(Buy).toHaveBeenCalledWith(interaction);

        expect(List).not.toHaveBeenCalled();
        expect(Use).not.toHaveBeenCalled();

        expect(AppLogger.LogError).not.toHaveBeenCalled();
    });

    test("GIVEN interaction subcommand is invalid, EXPECT error logged", async () => {
        // Arrange
        const interaction = GenerateCommandInteractionMock({
            subcommand: "invalid",
        });

        // Act
        const effects = new Effects();
        await effects.execute(interaction as unknown as CommandInteraction);

        // Assert
        expect(AppLogger.LogError).toHaveBeenCalledTimes(1);
        expect(AppLogger.LogError).toHaveBeenCalledWith("Commands/Effects", "Invalid subcommand: invalid");

        expect(List).not.toHaveBeenCalled();
        expect(Use).not.toHaveBeenCalled();
        expect(Buy).not.toHaveBeenCalled();
    });
});