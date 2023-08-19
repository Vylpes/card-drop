import { Client, REST, Routes, SlashCommandBuilder } from "discord.js";
import { EventType } from "../constants/EventType";
import IEventItem from "../contracts/IEventItem";
import { CoreClient } from "./client";

export class Util {
    public loadSlashCommands(client: Client) {
        const registeredCommands = CoreClient.commandItems;

        const globalCommands = registeredCommands.filter(x => !x.ServerId);
        const guildCommands = registeredCommands.filter(x => x.ServerId);

        const globalCommandData: SlashCommandBuilder[] = globalCommands
            .filter(x => x.Command.CommandBuilder)
            .flatMap(x => x.Command.CommandBuilder);

        const guildIds: string[] = [];

        for (let command of guildCommands) {
            if (!guildIds.find(x => x == command.ServerId)) {
                guildIds.push(command.ServerId!);
            }
        }

        const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN!);

        rest.put(
            Routes.applicationCommands(process.env.BOT_CLIENTID!),
            {
                body: globalCommandData
            }
        );

        for (let guild of guildIds) {
            const guildCommandData = guildCommands.filter(x => x.ServerId == guild)
                .filter(x => x.Command.CommandBuilder)
                .flatMap(x => x.Command.CommandBuilder);

            if (!client.guilds.cache.has(guild)) continue;
            
            rest.put(
                Routes.applicationGuildCommands(process.env.BOT_CLIENTID!, guild),
                {
                    body: guildCommandData
                }
            )
        }
    }

    // Load the events
    loadEvents(client: Client, events: IEventItem[]) {
        events.forEach((e) => {
            switch(e.EventType) {
                case EventType.ChannelCreate:
                    client.on('channelCreate', (channel) => e.ExecutionFunction(channel));
                    break;
                case EventType.ChannelDelete:
                    client.on('channelDelete', (channel) => e.ExecutionFunction(channel));
                    break;
                case EventType.ChannelUpdate:
                    client.on('channelUpdate', (channel) => e.ExecutionFunction(channel));
                    break;
                case EventType.GuildBanAdd:
                    client.on('guildBanAdd', (ban) => e.ExecutionFunction(ban));
                    break;
                case EventType.GuildBanRemove:
                    client.on('guildBanRemove', (ban) => e.ExecutionFunction(ban));
                    break;
                case EventType.GuildCreate:
                    client.on('guildCreate', (guild) => e.ExecutionFunction(guild));
                    break;
                case EventType.GuildMemberAdd:
                    client.on('guildMemberAdd', (member) => e.ExecutionFunction(member));
                    break;
                case EventType.GuildMemberRemove:
                    client.on('guildMemberRemove', (member) => e.ExecutionFunction(member));
                    break;
                case EventType.GuildMemberUpdate:
                    client.on('guildMemberUpdate', (oldMember, newMember) => e.ExecutionFunction(oldMember, newMember));
                    break;
                case EventType.MessageCreate:
                    client.on('messageCreate', (message) => e.ExecutionFunction(message));
                    break;
                case EventType.MessageDelete:
                    client.on('messageDelete', (message) => e.ExecutionFunction(message));
                    break;
                case EventType.MessageUpdate:
                    client.on('messageUpdate', (oldMessage, newMessage) => e.ExecutionFunction(oldMessage, newMessage));
                    break;
                default:
                    console.error('Event not implemented.');
            }
        });
    }
}
