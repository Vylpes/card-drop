import {StringSelectMenuInteraction} from "discord.js";
import {CoreClient} from "../client";
import AppLogger from "../appLogger";

export default class StringDropdown {
    public static async onStringDropdownSelected(interaction: StringSelectMenuInteraction) {
        const item = CoreClient.stringDropdowns.find(x => x.DropdownId === interaction.customId.split(" ")[0]);

        if (!item) {
            AppLogger.LogVerbose("StringDropdown", `Event not found: ${interaction.customId}`);

            await interaction.reply("Event not found");
            return;
        }

        try {
            AppLogger.LogDebug("StringDropdown", `Executing ${interaction.customId}`);

            await item.Event.execute(interaction);
        } catch (e) {
            AppLogger.LogError("StringDropdown", `Error occurred while executing event: ${interaction.customId}`);
            AppLogger.CatchError("StringDropdown", e);

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
