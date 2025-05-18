import { AttachmentBuilder, ButtonInteraction, EmbedBuilder } from "discord.js";
import { ButtonEvent } from "../type/buttonEvent";
import AppLogger from "../client/appLogger";
import Inventory from "../database/entities/app/Inventory";
import EmbedColours from "../constants/EmbedColours";
import { readFileSync } from "fs";
import path from "path";
import ErrorMessages from "../constants/ErrorMessages";
import User from "../database/entities/app/User";
import { GetSacrificeAmount } from "../constants/CardRarity";
import GetCardsHelper from "../helpers/DropHelpers/GetCardsHelper";
import MultidropEmbedHelper from "../helpers/DropHelpers/MultidropEmbedHelper";

export default class Multidrop extends ButtonEvent {
    public override async execute(interaction: ButtonInteraction) {
        const action = interaction.customId.split(" ")[1];

        switch (action) {
        case "keep":
            await this.Keep(interaction);
            break;
        case "sacrifice":
            await this.Sacrifice(interaction);
            break;
        default:
            await interaction.reply("Invalid action");
            AppLogger.LogError("Button/Multidrop", `Invalid action, ${action}`);
        }
    }

    private async Keep(interaction: ButtonInteraction) {
        const cardNumber = interaction.customId.split(" ")[2];
        let cardsRemaining = Number(interaction.customId.split(" ")[3]) || 0;
        const userId = interaction.customId.split(" ")[4];

        if (interaction.user.id != userId) {
            await interaction.reply("You're not the user this drop was made for!");
            return;
        }

        const card = GetCardsHelper.GetCardByCardNumber(cardNumber);

        if (!card) {
            await interaction.reply("Unable to find card.");
            AppLogger.LogWarn("Button/Multidrop/Keep", `Card not found, ${cardNumber}`);
            return;
        }

        if (cardsRemaining < 0) {
            await interaction.reply("Your multidrop has ran out! Please buy a new one!");
            return;
        }

        const user = await User.FetchOneById(User, interaction.user.id);

        if (!user) {
            AppLogger.LogWarn("Button/Multidrop/Keep", ErrorMessages.UnableToFetchUser);
            await interaction.reply(ErrorMessages.UnableToFetchUser);
            return;
        }

        // Claim
        let inventory = await Inventory.FetchOneByCardNumberAndUserId(interaction.user.id, cardNumber);

        if (!inventory) {
            inventory = new Inventory(interaction.user.id, cardNumber, 1);
        } else {
            inventory.AddQuantity(1);
        }

        await inventory.Save(Inventory, inventory);

        // Pack has ran out
        if (cardsRemaining == 0) {
            const embed = new EmbedBuilder()
                .setDescription("Your multidrop has ran out! Please buy a new one!")
                .setColor(EmbedColours.Ok);

            await interaction.update({
                embeds: [ embed ],
                attachments: [],
                components: [],
            });

            return;
        }

        // Drop next card
        const randomCard = GetCardsHelper.GetRandomCard();
        cardsRemaining -= 1;

        if (!randomCard) {
            AppLogger.LogWarn("Button/Multidrop/Keep", ErrorMessages.UnableToFetchCard);
            await interaction.reply(ErrorMessages.UnableToFetchCard);
            return;
        }

        await interaction.deferUpdate();

        try {
            const image = readFileSync(path.join(process.env.DATA_DIR!, "cards", randomCard.card.path));
            const imageFileName = randomCard.card.path.split("/").pop()!;

            const attachment = new AttachmentBuilder(image, { name: imageFileName });

            const inventory = await Inventory.FetchOneByCardNumberAndUserId(interaction.user.id, randomCard.card.id);
            const quantityClaimed = inventory ? inventory.Quantity : 0;

            const embed = MultidropEmbedHelper.GenerateMultidropEmbed(randomCard, quantityClaimed, imageFileName, cardsRemaining, undefined, user.Currency);

            const row = MultidropEmbedHelper.GenerateMultidropButtons(randomCard, cardsRemaining, interaction.user.id, cardsRemaining < 0);

            await interaction.editReply({
                embeds: [ embed ],
                files: [ attachment ],
                components: [ row ],
            });
        } catch (e) {
            AppLogger.LogError("Button/Multidrop/Keep", `Error sending next drop for card ${randomCard.card.id}: ${e}`);

            await interaction.editReply(`Unable to send next drop. Please try again, and report this if it keeps happening. (${randomCard.card.id})`);
        }
    }

    private async Sacrifice(interaction: ButtonInteraction) {
        const cardNumber = interaction.customId.split(" ")[2];
        let cardsRemaining = Number(interaction.customId.split(" ")[3]) || 0;
        const userId = interaction.customId.split(" ")[4];

        if (interaction.user.id != userId) {
            await interaction.reply("You're not the user this drop was made for!");
            return;
        }

        const card = GetCardsHelper.GetCardByCardNumber(cardNumber);

        if (!card) {
            await interaction.reply("Unable to find card.");
            AppLogger.LogWarn("Button/Multidrop/Sacrifice", `Card not found, ${cardNumber}`);
            return;
        }

        if (cardsRemaining < 0) {
            await interaction.reply("Your multidrop has ran out! Please buy a new one!");
            return;
        }

        const user = await User.FetchOneById(User, interaction.user.id);

        if (!user) {
            AppLogger.LogWarn("Button/Multidrop/Sacrifice", ErrorMessages.UnableToFetchUser);
            await interaction.reply(ErrorMessages.UnableToFetchUser);
            return;
        }

        // Sacrifice
        const sacrificeAmount = GetSacrificeAmount(card.card.type);

        user.AddCurrency(sacrificeAmount);

        await user.Save(User, user);

        // Pack has ran out
        if (cardsRemaining == 0) {
            const embed = new EmbedBuilder()
                .setDescription("Your multidrop has ran out! Please buy a new one!")
                .setColor(EmbedColours.Ok);

            await interaction.update({
                embeds: [ embed ],
                attachments: [],
                components: [],
            });

            return;
        }

        // Drop next card
        const randomCard = GetCardsHelper.GetRandomCard();
        cardsRemaining -= 1;

        if (!randomCard) {
            AppLogger.LogWarn("Button/Multidrop/Sacrifice", ErrorMessages.UnableToFetchCard);
            await interaction.reply(ErrorMessages.UnableToFetchCard);
            return;
        }

        await interaction.deferUpdate();

        try {
            const image = readFileSync(path.join(process.env.DATA_DIR!, "cards", randomCard.card.path));
            const imageFileName = randomCard.card.path.split("/").pop()!;

            const attachment = new AttachmentBuilder(image, { name: imageFileName });

            const inventory = await Inventory.FetchOneByCardNumberAndUserId(interaction.user.id, randomCard.card.id);
            const quantityClaimed = inventory ? inventory.Quantity : 0;

            const embed = MultidropEmbedHelper.GenerateMultidropEmbed(randomCard, quantityClaimed, imageFileName, cardsRemaining, undefined, user.Currency);

            const row = MultidropEmbedHelper.GenerateMultidropButtons(randomCard, cardsRemaining, interaction.user.id, cardsRemaining < 0);

            await interaction.editReply({
                embeds: [ embed ],
                files: [ attachment ],
                components: [ row ],
            });
        } catch (e) {
            AppLogger.LogError("Button/Multidrop/Sacrifice", `Error sending next drop for card ${randomCard.card.id}: ${e}`);

            await interaction.editReply(`Unable to send next drop. Please try again, and report this if it keeps happening. (${randomCard.card.id})`);
        }
    }
}