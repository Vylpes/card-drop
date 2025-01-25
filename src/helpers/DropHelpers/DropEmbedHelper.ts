import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import { DropResult } from "../../contracts/SeriesMetadata";
import AppLogger from "../../client/appLogger";
import { CardRarityToColour, CardRarityToString } from "../../constants/CardRarity";
import StringTools from "../StringTools";
import CardConstants from "../../constants/CardConstants";

export default class DropEmbedHelper {
    public static GenerateDropEmbed(drop: DropResult, quantityClaimed: number, imageFileName: string, claimedBy?: string, currency?: number): EmbedBuilder {
        AppLogger.LogSilly("CardDropHelperMetadata/GenerateDropEmbed", `Parameters: drop=${drop.card.id}, quantityClaimed=${quantityClaimed}, imageFileName=${imageFileName}`);

        const description = drop.card.subseries ?? drop.series.name;
        let colour = CardRarityToColour(drop.card.type);

        if (drop.card.colour && StringTools.IsHexCode(drop.card.colour)) {
            const hexCode = Number("0x" + drop.card.colour);

            if (hexCode) {
                colour = hexCode;
            } else {
                AppLogger.LogWarn("CardDropHelperMetadata/GenerateDropEmbed", `Card's colour override is invalid: ${drop.card.id}, ${drop.card.colour}`);
            }
        } else if (drop.card.colour) {
            AppLogger.LogWarn("CardDropHelperMetadata/GenerateDropEmbed", `Card's colour override is invalid: ${drop.card.id}, ${drop.card.colour}`);
        }

        let imageUrl = `attachment://${imageFileName}`;

        if (drop.card.path.startsWith("http://") || drop.card.path.startsWith("https://")) {
            imageUrl = drop.card.path;
        }

        const embed = new EmbedBuilder()
            .setTitle(drop.card.name)
            .setDescription(description)
            .setFooter({ text: `${CardRarityToString(drop.card.type)} · ${drop.card.id}` })
            .setColor(colour)
            .setImage(imageUrl)
            .addFields([
                {
                    name: "Claimed",
                    value: `${quantityClaimed}`,
                    inline: true,
                }
            ]);

        if (claimedBy != null) {
            embed.addFields([
                {
                    name: "Claimed by",
                    value: claimedBy,
                    inline: true,
                }
            ]);
        }

        if (currency != null) {
            embed.addFields([
                {
                    name: "Currency",
                    value: `${currency}`,
                    inline: true,
                }
            ]);
        }

        return embed;
    }

    public static GenerateDropButtons(drop: DropResult, claimId: string, userId: string, disabled: boolean = false): ActionRowBuilder<ButtonBuilder> {
        AppLogger.LogSilly("CardDropHelperMetadata/GenerateDropButtons", `Parameters: drop=${drop.card.id}, claimId=${claimId}, userId=${userId}`);

        return new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`claim ${drop.card.id} ${claimId} ${userId}`)
                    .setLabel(`Claim (${CardConstants.ClaimCost} 🪙)`)
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(disabled),
                new ButtonBuilder()
                    .setCustomId("reroll")
                    .setLabel("Reroll")
                    .setStyle(ButtonStyle.Secondary));
    }
}