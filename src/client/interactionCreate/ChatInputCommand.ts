import { Interaction } from "discord.js";
import { CoreClient } from "../client";
import ICommandItem from "../../contracts/ICommandItem";

export default class ChatInputCommand {
    public static async onChatInput(interaction: Interaction) {
        if (!interaction.isChatInputCommand()) return;

        const item = CoreClient.commandItems.find(x => x.Name == interaction.commandName && !x.ServerId);
        const itemForServer = CoreClient.commandItems.find(x => x.Name == interaction.commandName && x.ServerId == interaction.guildId);

        let itemToUse: ICommandItem;

        if (!itemForServer) {
            if (!item) {
                await interaction.reply('Command not found');
                return;
            }

            itemToUse = item;
        } else {
            itemToUse = itemForServer;
        }

        itemToUse.Command.execute(interaction);
    }
}