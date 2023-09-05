import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, CacheType, DiscordAPIError, EmbedBuilder } from "discord.js";
import { ButtonEvent } from "../type/buttonEvent";
import CardDropHelper from "../helpers/CardDropHelper";
import { readFileSync } from "fs";
import { CardRarityToColour, CardRarityToString } from "../constants/CardRarity";
import { v4 } from "uuid";
import { CoreClient } from "../client/client";
import Card from "../database/entities/card/Card";

export default class Reroll extends ButtonEvent {
    public override async execute(interaction: ButtonInteraction) {
        if (!interaction.guild || !interaction.guildId) return;

        let randomCard = await CardDropHelper.GetRandomCard();

        if (process.env.DROP_RARITY && Number(process.env.DROP_RARITY) > 0) {
            randomCard = await CardDropHelper.GetRandomCardByRarity(Number(process.env.DROP_RARITY));
        } else if (process.env.DROP_CARD && process.env.DROP_CARD != '-1') {
            let card = await Card.FetchOneByCardNumber(process.env.DROP_CARD, [ "Series" ]);

            if (!card) {
                await interaction.reply("Card not found");
                return;
            }

            randomCard = card;
        }

        const image = readFileSync(randomCard.Path);

        const attachment = new AttachmentBuilder(image, { name: randomCard.FileName });

        const embed = new EmbedBuilder()
            .setTitle(randomCard.Name)
            .setDescription(randomCard.Series.Name)
            .setFooter({ text: CardRarityToString(randomCard.Rarity) })
            .setColor(CardRarityToColour(randomCard.Rarity))
            .setImage(`attachment://${randomCard.FileName}`);

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

        try {
            await interaction.editReply({
                embeds: [ embed ],
                files: [ attachment ],
                components: [ row ],
            });
        } catch (e) {
            console.error(e);


            if (e instanceof DiscordAPIError) {
                await interaction.editReply(`Unable to send next drop. Please try again, and report this if it keeps happening. Code: ${e.code}`);
            } else {
                await interaction.editReply(`Unable to send next drop. Please try again, and report this if it keeps happening. Code: UNKNOWN`);
            }
        }

        CoreClient.ClaimId = claimId;
    }
}