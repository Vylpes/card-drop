import { ButtonInteraction } from "discord.js";
import { CoreClient } from "../client";
import AppLogger from "../appLogger";

export default class Button {
    public static async onButtonClicked(interaction: ButtonInteraction) {
        if (!interaction.isButton) return;

        const item = CoreClient.buttonEvents.find(x => x.ButtonId == interaction.customId.split(" ")[0]);

        if (!item) {
            AppLogger.LogVerbose("Button", `Event not found: ${interaction.customId}`);

            await interaction.reply("Event not found");
            return;
        }

        try {
            AppLogger.LogDebug("Button", `Executing ${interaction.customId}`);

            item.Event.execute(interaction);
        } catch (e) {
            AppLogger.LogError("Button", `Error occurred while executing event: ${interaction.customId}`);
            AppLogger.LogError("Button", e as string);

            await interaction.reply("An error occurred while executing the event");
        }
    }
}