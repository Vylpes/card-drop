import {CommandInteraction, SlashCommandBuilder} from "discord.js";
import {Command} from "../type/command";

export default class Effects extends Command {
    constructor() {
        super();

        this.CommandBuilder = new SlashCommandBuilder()
            .setName("effects")
            .setDescription("Effects");
    }

    public override async execute(interaction: CommandInteraction) {
    }
}
