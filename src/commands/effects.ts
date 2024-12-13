import {CommandInteraction, EmbedBuilder, SlashCommandBuilder} from "discord.js";
import {Command} from "../type/command";
import EffectHelper from "../helpers/EffectHelper";
import {EffectDetails} from "../constants/EffectDetails";

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
                    .setMinValue(1)))
            .addSubcommand(x => x
                .setName("use")
                .setDescription("Use an effect in your inventory")
                .addStringOption(y => y
                    .setName("id")
                    .setDescription("The effect id to use")
                    .setRequired(true)
                    .setChoices([
                        { name: "Unclaimed Chance Up", value: "unclaimed" },
                    ])));
    }

    public override async execute(interaction: CommandInteraction) {
        if (!interaction.isChatInputCommand()) return;

        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case "list":
                await this.List(interaction);
                break;
            case "use":
                await this.Use(interaction);
                break;
        }
    }

    private async List(interaction: CommandInteraction) {
        const pageOption = interaction.options.get("page");

        const page = !isNaN(Number(pageOption?.value)) ? Number(pageOption?.value) : 1;

        const result = await EffectHelper.GenerateEffectEmbed(interaction.user.id, page);

        await interaction.reply({
            embeds: [ result.embed ],
            components: [ result.row ],
        });
    }

    private async Use(interaction: CommandInteraction) {
        const id = interaction.options.get("id", true).value!.toString();

        const effectDetail = EffectDetails.get(id);

        if (!effectDetail) {
            await interaction.reply("Unable to find effect!");
            return;
        }

        const now = new Date();
        const whenExpires = new Date(now.getMilliseconds() + effectDetail.duration);

        const result = await EffectHelper.UseEffect(interaction.user.id, id, whenExpires);

        if (result) {
            const embed = new EmbedBuilder()
                .setTitle("Effect Used")
                .setDescription("You now have an active effect!")
                .addFields([
                    {
                        name: "Effect",
                        value: effectDetail.friendlyName,
                        inline: true,
                    },
                    {
                        name: "Expires",
                        value: `<t:${whenExpires.getMilliseconds()}:f>`,
                        inline: true,
                    },
                ]);

            await interaction.reply({ embeds: [ embed ] });
            return;
        }

        await interaction.reply("Unable to use effect! Please make sure you have it in your inventory");
    }
}
