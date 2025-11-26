import { ChatInputCommandInteraction } from "discord.js";
import { CoreClient } from "../client";
import ICommandItem from "../../contracts/ICommandItem";
import AppLogger from "../appLogger";

export default class ChatInputCommand {
    public static async onChatInput(interaction: ChatInputCommandInteraction) {
        const item = CoreClient.commandItems.find(x => x.Name == interaction.commandName && !x.ServerId);
        const itemForServer = CoreClient.commandItems.find(x => x.Name == interaction.commandName && x.ServerId == interaction.guildId);

        let itemToUse: ICommandItem;

        if (!itemForServer) {
            if (!item) {
                await interaction.reply("Command not found");
                return;
            }

            itemToUse = item;
        } else {
            itemToUse = itemForServer;
        }

        try {
            itemToUse.Command.execute(interaction);
        } catch (e) {
            AppLogger.LogError("ChatInputCommand", `Error occurred while executing command: ${interaction.commandName}`);
            AppLogger.LogError("ChatInputCommand", e as string);

            await interaction.reply("An error occurred while executing the command");
        }
    }
}