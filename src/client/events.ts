import { Interaction } from "discord.js";
import ChatInputCommand from "./interactionCreate/ChatInputCommand";
import Button from "./interactionCreate/Button";
import AppLogger from "./appLogger";
import NewUserDiscovery from "./interactionCreate/middleware/NewUserDiscovery";
import StringDropdown from "./interactionCreate/StringDropdown";

export class Events {
    public async onInteractionCreate(interaction: Interaction) {
        if (!interaction.guildId) return;

        await NewUserDiscovery(interaction);

        if (interaction.isChatInputCommand()) {
            AppLogger.LogVerbose("Client", `ChatInputCommand: ${interaction.commandName}`);
            ChatInputCommand.onChatInput(interaction);
        }

        if (interaction.isButton()) {
            AppLogger.LogVerbose("Client", `Button: ${interaction.customId}`);
            Button.onButtonClicked(interaction);
        }

        if (interaction.isStringSelectMenu()) {
            AppLogger.LogVerbose("Client", `StringDropdown: ${interaction.customId}`);
            StringDropdown.onStringDropdownSelected(interaction);
        }
    }

    // Emit when bot is logged in and ready to use
    public onReady() {
        AppLogger.LogInfo("Client", "Ready");
    }
}
