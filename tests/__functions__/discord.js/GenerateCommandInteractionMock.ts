import { CommandInteraction } from "../../__types__/discord.js";

export default function GenerateCommandInteractionMock(options?: {
    subcommand?: string,
}): CommandInteraction {
    return {
        isChatInputCommand: jest.fn().mockReturnValue(true),
        options: {
            getSubcommand: jest.fn().mockReturnValue(options?.subcommand),
        },
    };
}