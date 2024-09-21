import {StringSelectMenuInteraction} from "discord.js";
import {CoreClient} from "../client";
import AppLogger from "../appLogger";

export default class StringDropdown {
    public static async onStringDropdownSelected(interaction: StringSelectMenuInteraction) {
        if (!interaction.isStringSelectMenu()) return;

        const item = CoreClient.stringDropdowns.find(x => x.DropdownId == interaction.customId.split(" ")[0]);

        if (!item) {
            AppLogger.LogVerbose("StringDropdown", `Event not found: ${interaction.customId}`);

            await interaction.reply("Event not found");
            return;
        }

        try {
            AppLogger.LogDebug("StringDropdown", `Executing ${interaction.customId}`);

            item.Event.execute(interaction);
        } catch (e) {
            AppLogger.LogError("StringDropdown", `Error occurred while executing event: ${interaction.customId}`);
            AppLogger.LogError("StringDropdown", e as string);

            await interaction.reply("An error occurred while executing the event");
        }
    }
}
