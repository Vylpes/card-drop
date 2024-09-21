import {StringSelectMenuInteraction} from "discord.js";

export abstract class StringDropdownEvent {
    abstract execute(interaction: StringSelectMenuInteraction): Promise<void>;
}
