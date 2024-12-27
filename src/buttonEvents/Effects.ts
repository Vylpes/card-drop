import {ActionRowBuilder, ButtonBuilder, ButtonInteraction,ButtonStyle,Embed,EmbedBuilder} from "discord.js";
import {ButtonEvent} from "../type/buttonEvent";
import EffectHelper from "../helpers/EffectHelper";
import { EffectDetails } from "../constants/EffectDetails";
import TimeLengthInput from "../helpers/TimeLengthInput";
import EmbedColours from "../constants/EmbedColours";

export default class Effects extends ButtonEvent {
    public override async execute(interaction: ButtonInteraction) {
        const action = interaction.customId.split(" ")[1];

        switch (action) {
            case "list":
                await this.List(interaction);
                break;
            case "use":
                await this.Use(interaction);
                break;
        }
    }

    private async List(interaction: ButtonInteraction) {
        const pageOption = interaction.customId.split(" ")[2];

        const page = Number(pageOption);

        if (!page) {
            await interaction.reply("Page option is not a valid number");
            return;
        }

        const result = await EffectHelper.GenerateEffectEmbed(interaction.user.id, page);

        await interaction.update({
            embeds: [ result.embed ],
            components: [ result.row ],
        });
    }

    private async Use(interaction: ButtonInteraction) {
        const subaction = interaction.customId.split(" ")[2];

        switch (subaction) {
            case "confirm":
                await this.UseConfirm(interaction);
                break;
            case "cancel":
                await this.UseCancel(interaction);
                break;
        }
    }

    private async UseConfirm(interaction: ButtonInteraction) {
        const id = interaction.customId.split(" ")[3];

        const effectDetail = EffectDetails.get(id);

        if (!effectDetail) {
            await interaction.reply("Unable to find effect!");
            return;
        }

        const now = new Date();

        const whenExpires = new Date(now.getTime() + effectDetail.duration);

        const result = await EffectHelper.UseEffect(interaction.user.id, id, whenExpires);

        if (result) {
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
            return;
        }

        await interaction.reply("Unable to use effect! Please make sure you have it in your inventory and is not on cooldown");
    }

    private async UseCancel(interaction: ButtonInteraction) {
        const id = interaction.customId.split(" ")[3];

        const effectDetail = EffectDetails.get(id);

        if (!effectDetail) {
            await interaction.reply("Unable to find effect!");
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
}
