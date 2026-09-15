import { ButtonInteraction } from "discord.js";
import { CoreClient } from "../client";
import AppLogger from "../appLogger";

export default class Button {
    public static async onButtonClicked(interaction: ButtonInteraction) {
        const item = CoreClient.buttonEvents.find(x => x.ButtonId === interaction.customId.split(" ")[0]);

        if (!item) {
            await interaction.reply("Event not found");
            return;
        }

        try {
            await item.Event.execute(interaction);
        } catch (e) {
            AppLogger.LogError("Button", `Error occurred while executing event: ${interaction.customId}`);
            AppLogger.CatchError("Button", e);

            // The handler may already have replied or deferred before throwing, in which
            // case replying again would throw a second, unrelated error.
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp("An error occurred while executing the event");
            } else {
                await interaction.reply("An error occurred while executing the event");
            }
        }
    }
}