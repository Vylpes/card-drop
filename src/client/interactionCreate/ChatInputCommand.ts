import { Interaction } from "discord.js";
import { CoreClient } from "../client";
import ICommandItem from "../../contracts/ICommandItem";
import AppLogger from "../appLogger";

export default class ChatInputCommand {
    public static async onChatInput(interaction: Interaction) {
        if (!interaction.isChatInputCommand()) return;

        const item = CoreClient.commandItems.find(x => x.Name == interaction.commandName && !x.ServerId);
        const itemForServer = CoreClient.commandItems.find(x => x.Name == interaction.commandName && x.ServerId == interaction.guildId);

        let itemToUse: ICommandItem;

        if (!itemForServer) {
            if (!item) {
                AppLogger.LogVerbose("ChatInputCommand", `Command not found: ${interaction.commandName}`);

                await interaction.reply("Command not found");
                return;
            }

            itemToUse = item;
        } else {
            itemToUse = itemForServer;
        }

        try {
            AppLogger.LogDebug("Command", `Executing ${interaction.commandName}`);

            itemToUse.Command.execute(interaction);
        } catch (e) {
            AppLogger.LogError("ChatInputCommand", `Error occurred while executing command: ${interaction.commandName}`);
            AppLogger.LogError("ChatInputCommand", e as string);

            await interaction.reply("An error occurred while executing the command");
        }
    }
}