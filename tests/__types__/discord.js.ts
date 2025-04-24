export type ButtonInteraction = {
    guild: object | null,
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
    update: jest.Func,
    reply: jest.Func,
}

export type CommandInteraction = {
    deferReply: jest.Func,
    editReply: jest.Func,
    isChatInputCommand: jest.Func,
    options: {
        getSubcommand: jest.Func,
    },
    user: {
        id: string,
    },
}