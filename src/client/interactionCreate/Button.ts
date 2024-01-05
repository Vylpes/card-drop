import { ButtonInteraction } from "discord.js";
import { CoreClient } from "../client";

export default class Button {
    public static async onButtonClicked(interaction: ButtonInteraction) {
        if (!interaction.isButton) return;

        const item = CoreClient.buttonEvents.find(x => x.ButtonId == interaction.customId.split(" ")[0]);

        if (!item) {
            await interaction.reply("Event not found");
            return;
        }

        item.Event.execute(interaction);
    }
}