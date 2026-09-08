import { ChatInputCommandInteraction } from "discord.js";
import ChatInputCommand from "../../../src/client/interactionCreate/ChatInputCommand";
import { CoreClient } from "../../../src/client/client";
import AppLogger from "../../../src/client/appLogger";
import ICommandItem from "../../../src/contracts/ICommandItem";

jest.mock("../../../src/client/appLogger");

type InteractionMock = {
    commandName: string,
    guildId: string | null,
    replied: boolean,
    deferred: boolean,
    reply: jest.Mock,
    followUp: jest.Mock,
};

function generateInteraction(commandName: string, guildId: string | null = "guildId"): InteractionMock {
    return {
        commandName,
        guildId,
        replied: false,
        deferred: false,
        reply: jest.fn(),
        followUp: jest.fn()
    };
}

function registerCommands(items: { Name: string, ServerId?: string, execute: jest.Mock }[]) {
    jest.spyOn(CoreClient, "commandItems", "get").mockReturnValue(items.map(item => ({
        Name: item.Name,
        ServerId: item.ServerId,
        Environment: 0,
        Command: { execute: item.execute }
    }) as unknown as ICommandItem));
}

describe("GIVEN the global command exists", () => {
    let interaction: InteractionMock;
    let execute: jest.Mock;

    beforeAll(async () => {
        jest.resetAllMocks();

        execute = jest.fn().mockResolvedValue(undefined);
        registerCommands([{ Name: "test", execute }]);

        interaction = generateInteraction("test");

        await ChatInputCommand.onChatInput(interaction as unknown as ChatInputCommandInteraction);
    });

    test("EXPECT the command to be executed with the interaction", () => {
        expect(execute).toHaveBeenCalledTimes(1);
        expect(execute).toHaveBeenCalledWith(interaction);
    });

    test("EXPECT no error reply", () => {
        expect(interaction.reply).not.toHaveBeenCalled();
        expect(interaction.followUp).not.toHaveBeenCalled();
    });
});

describe("GIVEN a server specific command exists for the guild", () => {
    let globalExecute: jest.Mock;
    let serverExecute: jest.Mock;

    beforeAll(async () => {
        jest.resetAllMocks();

        globalExecute = jest.fn().mockResolvedValue(undefined);
        serverExecute = jest.fn().mockResolvedValue(undefined);

        registerCommands([
            { Name: "test", execute: globalExecute },
            { Name: "test", ServerId: "guildId", execute: serverExecute }
        ]);

        await ChatInputCommand.onChatInput(generateInteraction("test") as unknown as ChatInputCommandInteraction);
    });

    test("EXPECT the server specific command to take priority", () => {
        expect(serverExecute).toHaveBeenCalledTimes(1);
        expect(globalExecute).not.toHaveBeenCalled();
    });
});

describe("GIVEN the command does not exist", () => {
    let interaction: InteractionMock;

    beforeAll(async () => {
        jest.resetAllMocks();

        registerCommands([{ Name: "test", execute: jest.fn() }]);

        interaction = generateInteraction("unknown");

        await ChatInputCommand.onChatInput(interaction as unknown as ChatInputCommandInteraction);
    });

    test("EXPECT the user to be told the command was not found", () => {
        expect(interaction.reply).toHaveBeenCalledTimes(1);
        expect(interaction.reply).toHaveBeenCalledWith("Command not found");
    });
});

describe("GIVEN the command rejects AND the interaction has not been replied to", () => {
    let interaction: InteractionMock;
    const error = new Error("qa-dispatch");

    beforeAll(async () => {
        jest.resetAllMocks();

        registerCommands([{ Name: "test", execute: jest.fn().mockRejectedValue(error) }]);

        interaction = generateInteraction("test");

        await ChatInputCommand.onChatInput(interaction as unknown as ChatInputCommandInteraction);
    });

    test("EXPECT the rejection to be caught and logged as an error object", () => {
        expect(AppLogger.CatchError).toHaveBeenCalledTimes(1);
        expect(AppLogger.CatchError).toHaveBeenCalledWith("ChatInputCommand", error);
    });

    test("EXPECT the user to receive the error reply", () => {
        expect(interaction.reply).toHaveBeenCalledTimes(1);
        expect(interaction.reply).toHaveBeenCalledWith("An error occurred while executing the command");
    });
});

describe("GIVEN the command rejects AND the interaction has already been replied to", () => {
    let interaction: InteractionMock;

    beforeAll(async () => {
        jest.resetAllMocks();

        registerCommands([{ Name: "test", execute: jest.fn().mockRejectedValue(new Error("qa-dispatch")) }]);

        interaction = generateInteraction("test");
        interaction.replied = true;

        await ChatInputCommand.onChatInput(interaction as unknown as ChatInputCommandInteraction);
    });

    test("EXPECT the error to be sent as a follow up instead of a reply", () => {
        expect(interaction.followUp).toHaveBeenCalledTimes(1);
        expect(interaction.followUp).toHaveBeenCalledWith("An error occurred while executing the command");
        expect(interaction.reply).not.toHaveBeenCalled();
    });
});
