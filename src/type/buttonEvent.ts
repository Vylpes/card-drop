import { ButtonInteraction } from "discord.js";

export abstract class ButtonEvent {
    abstract execute(interaction: ButtonInteraction): Promise<void>;
}