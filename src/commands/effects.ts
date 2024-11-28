import {CommandInteraction, SlashCommandBuilder} from "discord.js";
import {Command} from "../type/command";
import EffectHelper from "../helpers/EffectHelper";

export default class Effects extends Command {
    constructor() {
        super();

        this.CommandBuilder = new SlashCommandBuilder()
            .setName("effects")
            .setDescription("Effects")
            .addSubcommand(x => x
                .setName("list")
                .setDescription("List all effects I have")
                .addNumberOption(x => x
                    .setName("page")
                    .setDescription("The page number")
                    .setMinValue(1)));
    }

    public override async execute(interaction: CommandInteraction) {
        if (!interaction.isChatInputCommand()) return;

        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case "list":
                await this.List(interaction);
                break;
        }
    }

    private async List(interaction: CommandInteraction) {
        const pageOption = interaction.options.get("page");

        const page = pageOption && Number(pageOption.value) ? Number(pageOption.value) : 1;

        const result = await EffectHelper.GenerateEffectEmbed(interaction.user.id, page);

        await interaction.reply({
            embeds: [ result.embed ],
            components: [ result.row ],
        });
    }
}
