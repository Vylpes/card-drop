import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, EmbedBuilder } from "discord.js";
import { ButtonEvent } from "../type/buttonEvent";
import Inventory from "../database/entities/app/Inventory";
import CardDropHelperMetadata from "../helpers/CardDropHelperMetadata";
import { CardRarityToString, GetSacrificeAmount } from "../constants/CardRarity";
import EmbedColours from "../constants/EmbedColours";
import User from "../database/entities/app/User";

export default class Sacrifice extends ButtonEvent {
    public override async execute(interaction: ButtonInteraction) {
        const subcommand = interaction.customId.split(" ")[1];

        switch(subcommand) {
        case "confirm":
            await this.confirm(interaction);
            break;
        case "cancel":
            await this.cancel(interaction);
            break;
        }
    }

    private async confirm(interaction: ButtonInteraction) {
        const userId = interaction.customId.split(" ")[2];
        const cardNumber = interaction.customId.split(" ")[3];

        const cardInInventory = await Inventory.FetchOneByCardNumberAndUserId(userId, cardNumber);

        if (!cardInInventory) {
            await interaction.reply("Unable to find card in inventory.");
            return;
        }

        const cardData = CardDropHelperMetadata.GetCardByCardNumber(cardNumber);

        if (!cardData) {
            await interaction.reply("Unable to find card in the database.");
            return;
        }

        const user = await User.FetchOneById(User, userId);

        if (!user) {
            await interaction.reply("Unable to find user in database.");
            return;
        }

        cardInInventory.RemoveQuantity(1);

        await cardInInventory.Save(Inventory, cardInInventory);

        const cardValue = GetSacrificeAmount(cardData.card.type);
        const cardRarityString = CardRarityToString(cardData.card.type);

        user.AddCurrency(cardValue);

        await user.Save(User, user);

        const description = [
            `Card: ${cardData.card.name}`,
            `Series: ${cardData.series.name}`,
            `Rarity: ${cardRarityString}`,
            `Quantity Owned: ${cardInInventory.Quantity}`,
            `Sacrifice Amount: ${cardValue}`,
        ];

        const embed = new EmbedBuilder()
            .setTitle("Card Sacrificed")
            .setDescription(description.join("\n"))
            .setColor(EmbedColours.Ok)
            .setFooter({ text: `${interaction.user.username} · ${cardData.card.name}` });

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents([
                new ButtonBuilder()
                    .setCustomId(`sacrifice confirm ${interaction.user.id} ${cardNumber}`)
                    .setLabel("Confirm")
                    .setStyle(ButtonStyle.Success)
                    .setDisabled(true),
                new ButtonBuilder()
                    .setCustomId("sacrifice cancel")
                    .setLabel("Cancel")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(true),
            ]);

        await interaction.update({
            embeds: [ embed ],
            components: [ row ],
        });
    }

    private async cancel(interaction: ButtonInteraction) {
        const userId = interaction.customId.split(" ")[2];
        const cardNumber = interaction.customId.split(" ")[3];

        const cardInInventory = await Inventory.FetchOneByCardNumberAndUserId(userId, cardNumber);

        if (!cardInInventory) {
            await interaction.reply("Unable to find card in inventory.");
            return;
        }

        const cardData = CardDropHelperMetadata.GetCardByCardNumber(cardNumber);

        if (!cardData) {
            await interaction.reply("Unable to find card in the database.");
            return;
        }

        const cardValue = GetSacrificeAmount(cardData.card.type);
        const cardRarityString = CardRarityToString(cardData.card.type);

        const description = [
            `Card: ${cardData.card.name}`,
            `Series: ${cardData.series.name}`,
            `Rarity: ${cardRarityString}`,
            `Quantity Owned: ${cardInInventory.Quantity}`,
            `Sacrifice Amount: ${cardValue}`,
        ];

        const embed = new EmbedBuilder()
            .setTitle("Sacrifice Cancelled")
            .setDescription(description.join("\n"))
            .setColor(EmbedColours.Error)
            .setFooter({ text: `${interaction.user.username} · ${cardData.card.name}` });

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents([
                new ButtonBuilder()
                    .setCustomId(`sacrifice confirm ${interaction.user.id} ${cardNumber}`)
                    .setLabel("Confirm")
                    .setStyle(ButtonStyle.Success)
                    .setDisabled(true),
                new ButtonBuilder()
                    .setCustomId("sacrifice cancel")
                    .setLabel("Cancel")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(true),
            ]);

        await interaction.update({
            embeds: [ embed ],
            components: [ row ],
        });
    }
}