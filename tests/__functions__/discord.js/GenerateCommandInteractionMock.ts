import { ChatInputCommandInteraction } from "../../__types__/discord.js";

export default function GenerateCommandInteractionMock(options?: {
    subcommand?: string,
}): ChatInputCommandInteraction{
    return {
        deferReply: jest.fn(),
        editReply: jest.fn(),
        isChatInputCommand: jest.fn().mockReturnValue(true),
        options: {
            getSubcommand: jest.fn().mockReturnValue(options?.subcommand),
        },
        user: {
            id: "userId",
        },
    };
}