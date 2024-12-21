import {ActionRowBuilder, ButtonBuilder, ButtonStyle, CommandInteraction, EmbedBuilder, SlashCommandBuilder} from "discord.js";
import {Command} from "../type/command";
import EffectHelper from "../helpers/EffectHelper";
import {EffectDetails} from "../constants/EffectDetails";
import UserEffect from "../database/entities/app/UserEffect";
import TimeLengthInput from "../helpers/TimeLengthInput";

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

        const canUseEffect = await EffectHelper.CanUseEffect(interaction.user.id, id);

        if (!canUseEffect) {
            await interaction.reply("Unable to use effect! Please make sure you have it in your inventory and is not on cooldown");
            return;
        }

        const timeLengthInput = TimeLengthInput.ConvertFromMilliseconds(effectDetail.duration);

        const embed = new EmbedBuilder()
            .setTitle("Effect Confirmation")
            .setDescription("Would you like to use this effect?")
            .addFields([
                {
                    name: "Effect",
                    value: effectDetail.friendlyName,
                    inline: true,
                },
                {
                    name: "Length",
                    value: timeLengthInput.GetLengthShort(),
                    inline: true,
                },
            ]);

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents([
                new ButtonBuilder()
                    .setLabel("Confirm")
                    .setCustomId(`effects use confirm ${effectDetail.id}`)
                    .setStyle(ButtonStyle.Primary),
            ]);

        await interaction.reply({
            embeds: [ embed ],
            components: [ row ],
        });
    }
}
