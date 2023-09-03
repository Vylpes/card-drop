import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, CacheType, EmbedBuilder } from "discord.js";
import { ButtonEvent } from "../type/buttonEvent";
import CardDropHelper from "../helpers/CardDropHelper";
import { readFileSync } from "fs";
import { CardRarityToColour, CardRarityToString } from "../constants/CardRarity";
import { v4 } from "uuid";
import { CoreClient } from "../client/client";

export default class Reroll extends ButtonEvent {
    public override async execute(interaction: ButtonInteraction) {
        if (!interaction.guild || !interaction.guildId) return;

        const randomCard = await CardDropHelper.GetRandomCard();

        const image = readFileSync(randomCard.Path);

        const attachment = new AttachmentBuilder(image, { name: `${randomCard.Id}.png` });

        const embed = new EmbedBuilder()
            .setTitle(randomCard.Name)
            .setDescription(randomCard.Series.Name)
            .setFooter({ text: CardRarityToString(randomCard.Rarity) })
            .setColor(CardRarityToColour(randomCard.Rarity))
            .setImage(`attachment://${randomCard.Id}.png`);

        const row = new ActionRowBuilder<ButtonBuilder>();

        const claimId = v4();

        row.addComponents(
            new ButtonBuilder()
                .setCustomId(`claim ${randomCard.CardNumber} ${claimId}`)
                .setLabel("Claim")
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId(`reroll`)
                .setLabel("Reroll")
                .setStyle(ButtonStyle.Secondary));

        await interaction.reply({
            embeds: [ embed ],
            files: [ attachment ],
            components: [ row ],
        });

        CoreClient.ClaimId = claimId;
    }
}