import { CommandInteraction, SlashCommandBuilder } from "discord.js";

export abstract class Command {
    public CommandBuilder: Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">;

    abstract execute(interaction: CommandInteraction): Promise<void>;
}
