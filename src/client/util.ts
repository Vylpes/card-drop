import { Client, REST, Routes, SlashCommandBuilder } from "discord.js";
import EventExecutors from "../contracts/EventExecutors";
import { CoreClient } from "./client";

export class Util {
    public loadSlashCommands(client: Client) {
        const registeredCommands = CoreClient.commandItems;

        const globalCommands = registeredCommands.filter(x => !x.ServerId);
        const guildCommands = registeredCommands.filter(x => x.ServerId);

        const globalCommandData: Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">[] = [];

        for (const command of globalCommands) {
            if (!command.Command.CommandBuilder) continue;

            if ((command.Environment & CoreClient.Environment) == CoreClient.Environment) {
                globalCommandData.push(command.Command.CommandBuilder);
            }
        }

        const guildIds: string[] = [];

        for (const command of guildCommands) {
            if (!guildIds.find(x => x == command.ServerId)) {
                guildIds.push(command.ServerId!);
            }
        }

        const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN!);

        rest.put(
            Routes.applicationCommands(process.env.BOT_CLIENTID!),
            {
                body: globalCommandData
            }
        );

        for (const guild of guildIds) {
            const guildCommandData: Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">[] = [];

            for (const command of guildCommands.filter(x => x.ServerId == guild)) {
                if (!command.Command.CommandBuilder) continue;

                if ((command.Environment & CoreClient.Environment) == CoreClient.Environment) {
                    guildCommandData.push(command.Command.CommandBuilder);
                }
            }

            if (!client.guilds.cache.has(guild)) continue;

            rest.put(
                Routes.applicationGuildCommands(process.env.BOT_CLIENTID!, guild),
                {
                    body: guildCommandData
                }
            );
        }
    }

    // Load the events
    loadEvents(client: Client, events: EventExecutors) {
        client.on("channelCreate", (channel) => events.ChannelCreate.forEach((fn) => fn(channel)));
        client.on("channelDelete", (channel) => events.ChannelDelete.forEach((fn) => fn(channel)));
        client.on("channelUpdate", (channel) => events.ChannelUpdate.forEach((fn) => fn(channel)));
        client.on("guildBanAdd", (ban) => events.GuildBanAdd.forEach((fn) => fn(ban)));
        client.on("guildBanRemove", (ban) => events.GuildBanRemove.forEach((fn) => fn(ban)));
        client.on("guildCreate", (guild) => events.GuildCreate.forEach((fn) => fn(guild)));
        client.on("guildMemberAdd", (member) => events.GuildMemberAdd.forEach((fn) => fn(member)));
        client.on("guildMemberRemove", (member) => events.GuildMemberRemove.forEach((fn) => fn(member)));
        client.on("guildMemberUpdate", (oldMember, newMember) => events.GuildMemebrUpdate.forEach((fn) => fn(oldMember, newMember)));
        client.on("messageCreate", (message) => events.MessageCreate.forEach((fn) => fn(message)));
        client.on("messageDelete", (message) => events.MessageDelete.forEach((fn) => fn(message)));
        client.on("messageUpdate", (oldMessage, newMessage) => events.MessageUpdate.forEach((fn) => fn(oldMessage, newMessage)));
    }
}
