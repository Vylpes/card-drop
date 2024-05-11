import { CommandInteraction } from "discord.js";

export abstract class Command {
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any -- CommandBuilder type is dynamic depending on options and can't be strictly typed
    public CommandBuilder: any;

    abstract execute(interaction: CommandInteraction): Promise<void>;
}
