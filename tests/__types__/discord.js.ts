export type ButtonInteraction = {
    guild: {} | null,
    guildId: string | null,
    channel: {
        isSendable: jest.Func,
        send: jest.Func,
    } | null,
    deferUpdate: jest.Func,
    editReply: jest.Func,
    message: {
        createdAt: Date,
    } | null,
    user: {
        id: string,
    } | null,
    customId: string,
}