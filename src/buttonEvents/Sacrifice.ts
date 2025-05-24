import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, EmbedBuilder } from "discord.js";
import { ButtonEvent } from "../type/buttonEvent";
import Inventory from "../database/entities/app/Inventory";
import { CardRarityToString, GetSacrificeAmount } from "../constants/CardRarity";
import EmbedColours from "../constants/EmbedColours";
import User from "../database/entities/app/User";
import GetCardsHelper from "../helpers/DropHelpers/GetCardsHelper";
import CardConstants from "../constants/CardConstants";

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
        case "give":
            await this.give(interaction);
        }
    }

    private async confirm(interaction: ButtonInteraction) {
        const userId = interaction.customId.split(" ")[2];
        const cardNumber = interaction.customId.split(" ")[3];
        const quantity = Number(interaction.customId.split(" ")[4]) || 1;

        if (userId != interaction.user.id) {
            await interaction.reply("Only the user who created this sacrifice can confirm it.");
            return;
        }

        const cardInInventory = await Inventory.FetchOneByCardNumberAndUserId(userId, cardNumber);

        if (!cardInInventory || cardInInventory.Quantity == 0) {
            await interaction.reply("Unable to find card in inventory.");
            return;
        }

        if (cardInInventory.Quantity < quantity) {
            await interaction.reply("You can only sacrifice what you own.");
            return;
        }

        const cardData = GetCardsHelper.GetCardByCardNumber(cardNumber);

        if (!cardData) {
            await interaction.reply("Unable to find card in the database.");
            return;
        }

        const user = await User.FetchOneById(User, userId);

        if (!user) {
            await interaction.reply("Unable to find user in database.");
            return;
        }

        cardInInventory.RemoveQuantity(quantity);

        await cardInInventory.Save(Inventory, cardInInventory);

        const cardValue = GetSacrificeAmount(cardData.card.type) * quantity;
        const cardRarityString = CardRarityToString(cardData.card.type);

        user.AddCurrency(cardValue);

        await user.Save(User, user);

        const description = [
            `Card: ${cardData.card.name}`,
            `Series: ${cardData.series.name}`,
            `Rarity: ${cardRarityString}`,
            `Quantity Owned: ${cardInInventory.Quantity}`,
            `Quantity To Sacrifice: ${quantity}`,
            `Sacrifice Amount: ${cardValue}`,
        ];

        const embed = new EmbedBuilder()
            .setTitle("Card Sacrificed")
            .setDescription(description.join("\n"))
            .setColor(EmbedColours.Green)
            .setFooter({ text: `${interaction.user.username}` });

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
        const quantity = Number(interaction.customId.split(" ")[4]) || 1;

        if (userId != interaction.user.id) {
            await interaction.reply("Only the user who created this sacrifice can cancel it.");
            return;
        }

        const cardInInventory = await Inventory.FetchOneByCardNumberAndUserId(userId, cardNumber);

        if (!cardInInventory || cardInInventory.Quantity == 0) {
            await interaction.reply("Unable to find card in inventory.");
            return;
        }

        if (cardInInventory.Quantity < quantity) {
            await interaction.reply("You can only sacrifice what you own.");
            return;
        }

        const cardData = GetCardsHelper.GetCardByCardNumber(cardNumber);

        if (!cardData) {
            await interaction.reply("Unable to find card in the database.");
            return;
        }

        const cardValue = GetSacrificeAmount(cardData.card.type) * quantity;
        const cardRarityString = CardRarityToString(cardData.card.type);

        const description = [
            `Card: ${cardData.card.name}`,
            `Series: ${cardData.series.name}`,
            `Rarity: ${cardRarityString}`,
            `Quantity Owned: ${cardInInventory.Quantity}`,
            `Quantity To Sacrifice: ${quantity}`,
            `Sacrifice Amount: ${cardValue}`,
        ];

        const embed = new EmbedBuilder()
            .setTitle("Sacrifice Cancelled")
            .setDescription(description.join("\n"))
            .setColor(EmbedColours.Grey)
            .setFooter({ text: `${interaction.user.username}` });

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

    private async give(interaction: ButtonInteraction) {
        const userId = interaction.customId.split(" ")[2];
        const cardNumber = interaction.customId.split(" ")[3];
        const quantity = Number(interaction.customId.split(" ")[4]) || 1;

        if (userId != interaction.user.id) {
            await interaction.reply("Only the user who created this sacrifice can confirm it.");
            return;
        }

        const cardData = GetCardsHelper.GetCardByCardNumber(cardNumber);

        if (!cardData) {
            await interaction.reply("Unable to find card in the database.");
            return;
        }

        let user = await User.FetchOneById(User, userId);

        if (!user) {
            user = new User(userId, CardConstants.StartingCurrency);
        }

        const cardInInventory = await Inventory.FetchOneByCardNumberAndUserId(userId, cardNumber);
        let cardQuantity = 0;

        if (cardInInventory) {
            cardQuantity = cardInInventory.Quantity;
        }

        const cardValue = GetSacrificeAmount(cardData.card.type) * quantity;
        const cardRarityString = CardRarityToString(cardData.card.type);

        user.AddCurrency(cardValue);

        await user.Save(User, user);

        const description = [
            `Card: ${cardData.card.name}`,
            `Series: ${cardData.series.name}`,
            `Rarity: ${cardRarityString}`,
            `Quantity Owned: ${cardQuantity}`,
            `Quantity To Sacrifice: ${quantity}`,
            `Sacrifice Amount: ${cardValue}`,
        ];

        const embed = new EmbedBuilder()
            .setTitle("Card Sacrificed")
            .setDescription(description.join("\n"))
            .setColor(EmbedColours.Green)
            .setFooter({ text: `${interaction.user.username}` });

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
            attachments: [],
        });
    }
}