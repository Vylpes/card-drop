import { Interaction } from "discord.js";
import ICommandItem from "../contracts/ICommandItem";
import { CoreClient } from "./client";

export class Events {
    public async onInteractionCreate(interaction: Interaction) {
        if (!interaction.isChatInputCommand()) return;
        if (!interaction.guildId) return;

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

    // Emit when bot is logged in and ready to use
    public onReady() {
        console.log("Ready");
    }
}
