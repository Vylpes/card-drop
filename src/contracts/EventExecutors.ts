
import { DMChannel, Guild, GuildBan, GuildMember, Message, NonThreadGuildBasedChannel, PartialGuildMember, PartialMessage } from "discord.js";

interface EventExecutors {
    ChannelCreate: ((channel: NonThreadGuildBasedChannel) => void)[],
    ChannelDelete: ((channel: DMChannel | NonThreadGuildBasedChannel) => void)[],
    ChannelUpdate: ((channel: DMChannel | NonThreadGuildBasedChannel) => void)[],
    GuildBanAdd: ((ban: GuildBan) => void)[],
    GuildBanRemove: ((ban: GuildBan) => void)[],
    GuildCreate: ((guild: Guild) => void)[],
    GuildMemberAdd: ((member: GuildMember) => void)[],
    GuildMemberRemove: ((member: GuildMember | PartialGuildMember) => void)[],
    GuildMemebrUpdate: ((oldMember: GuildMember | PartialGuildMember, newMember: GuildMember) => void)[],
    MessageCreate: ((message: Message<boolean>) => void)[],
    MessageDelete: ((message: Message<boolean> | PartialMessage) => void)[],
    MessageUpdate: ((oldMessage: Message<boolean> | PartialMessage, newMessage: Message<boolean> | PartialMessage) => void)[],
}

export default EventExecutors;