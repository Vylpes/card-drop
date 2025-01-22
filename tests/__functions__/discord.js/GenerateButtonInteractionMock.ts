import { ButtonInteraction } from "../../__types__/discord.js";

export default function GenerateButtonInteractionMock(): ButtonInteraction {
    return {
        guild: {},
        guildId: "guildId",
        channel: {
            isSendable: jest.fn().mockReturnValue(true),
            send: jest.fn(),
        },
        deferUpdate: jest.fn(),
        editReply: jest.fn(),
        message: {
            createdAt: new Date(1000 * 60 * 27),
        },
        user: {
            id: "userId",
        },
        customId: "customId",
    };
}