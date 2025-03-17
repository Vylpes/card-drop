import { ActionRowBuilder, ButtonBuilder, ButtonStyle, CommandInteraction, EmbedBuilder } from "discord.js";
import { EffectDetails } from "../../constants/EffectDetails";
import AppLogger from "../../client/appLogger";
import EffectHelper from "../../helpers/EffectHelper";
import TimeLengthInput from "../../helpers/TimeLengthInput";
import EmbedColours from "../../constants/EmbedColours";

export default async function Use(interaction: CommandInteraction) {
    const id = interaction.options.get("id", true).value!.toString();

    const effectDetail = EffectDetails.get(id);

    if (!effectDetail) {
        AppLogger.LogWarn("Commands/Effects", `Unable to find effect details for ${id}`);

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
        .setColor(EmbedColours.Ok)
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
            new ButtonBuilder()
                .setLabel("Cancel")
                .setCustomId(`effects use cancel ${effectDetail.id}`)
                .setStyle(ButtonStyle.Danger),
        ]);

    await interaction.reply({
        embeds: [ embed ],
        components: [ row ],
    });
}