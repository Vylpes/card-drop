import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, EmbedBuilder } from "discord.js";
import { EffectDetails } from "../../constants/EffectDetails";
import EffectHelper from "../../helpers/EffectHelper";
import EmbedColours from "../../constants/EmbedColours";
import TimeLengthInput from "../../helpers/TimeLengthInput";
import AppLogger from "../../client/appLogger";

export default async function Use(interaction: ButtonInteraction) {
    const subaction = interaction.customId.split(" ")[2];

    switch (subaction) {
        case "confirm":
            await UseConfirm(interaction);
            break;
        case "cancel":
            await UseCancel(interaction);
            break;
    }
}

export async function UseConfirm(interaction: ButtonInteraction) {
    const id = interaction.customId.split(" ")[3];

    const effectDetail = EffectDetails.get(id);

    if (!effectDetail) {
        AppLogger.LogError("Button/Effects/Use", `Effect not found, ${id}`);

        await interaction.reply("Effect not found in system!");
        return;
    }

    const now = new Date();

    const whenExpires = new Date(now.getTime() + effectDetail.duration);

    const result = await EffectHelper.UseEffect(interaction.user.id, id, whenExpires);

    if (!result) {
        await interaction.reply("Unable to use effect! Please make sure you have it in your inventory and is not on cooldown");
        return;
    }

    const embed = new EmbedBuilder()
        .setTitle("Effect Used")
        .setDescription("You now have an active effect!")
        .setColor(EmbedColours.Green)
        .addFields([
            {
                name: "Effect",
                value: effectDetail.friendlyName,
                inline: true,
            },
            {
                name: "Expires",
                value: `<t:${Math.round(whenExpires.getTime() / 1000)}:f>`,
                inline: true,
            },
        ]);

    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents([
            new ButtonBuilder()
                .setLabel("Confirm")
                .setCustomId(`effects use confirm ${effectDetail.id}`)
                .setStyle(ButtonStyle.Primary)
                .setDisabled(true),
            new ButtonBuilder()
                .setLabel("Cancel")
                .setCustomId(`effects use cancel ${effectDetail.id}`)
                .setStyle(ButtonStyle.Danger)
                .setDisabled(true),
        ]);

    await interaction.update({
        embeds: [ embed ],
        components: [ row ],
    });
}

export async function UseCancel(interaction: ButtonInteraction) {
    const id = interaction.customId.split(" ")[3];

    const effectDetail = EffectDetails.get(id);

    if (!effectDetail) {
        AppLogger.LogError("Button/Effects/Cancel", `Effect not found, ${id}`);

        await interaction.reply("Effect not found in system!");
        return;
    }

    const timeLengthInput = TimeLengthInput.ConvertFromMilliseconds(effectDetail.duration);

    const embed = new EmbedBuilder()
        .setTitle("Effect Use Cancelled")
        .setDescription("The effect from your inventory has not been used")
        .setColor(EmbedColours.Grey)
        .addFields([
            {
                name: "Effect",
                value: effectDetail.friendlyName,
                inline: true,
            },
            {
                name: "Expires",
                value: timeLengthInput.GetLengthShort(),
                inline: true,
            },
        ]);

    const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents([
            new ButtonBuilder()
                .setLabel("Confirm")
                .setCustomId(`effects use confirm ${effectDetail.id}`)
                .setStyle(ButtonStyle.Primary)
                .setDisabled(true),
            new ButtonBuilder()
                .setLabel("Cancel")
                .setCustomId(`effects use cancel ${effectDetail.id}`)
                .setStyle(ButtonStyle.Danger)
                .setDisabled(true),
        ]);

    await interaction.update({
        embeds: [ embed ],
        components: [ row ],
    });
}