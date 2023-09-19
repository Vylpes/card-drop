import { Interaction } from "discord.js";
import ChatInputCommand from "./interactionCreate/ChatInputCommand";
import Button from "./interactionCreate/Button";
import { CoreClient } from "./client";

export class Events {
    public async onInteractionCreate(interaction: Interaction) {
        if (!interaction.guildId) return;

        if (interaction.isChatInputCommand()) {
            ChatInputCommand.onChatInput(interaction);
        }

        if (interaction.isButton()) {
            Button.onButtonClicked(interaction);
        }
    }

    // Emit when bot is logged in and ready to use
    public onReady() {
        console.log("Ready");
        console.log(`Bot Environment: ${CoreClient.Environment}`);
    }
}
