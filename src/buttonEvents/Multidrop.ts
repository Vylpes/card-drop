import { ButtonInteraction, EmbedBuilder } from "discord.js";
import { ButtonEvent } from "../type/buttonEvent";
import AppLogger from "../client/appLogger";
import { CoreClient } from "../client/client";
import CardDropHelperMetadata from "../helpers/CardDropHelperMetadata";
import Inventory from "../database/entities/app/Inventory";
import EmbedColours from "../constants/EmbedColours";
import { readFileSync } from "fs";
import path from "path";

export default class Multidrop extends ButtonEvent {
    public override async execute(interaction: ButtonInteraction) {
        const action = interaction.customId.split(" ")[1];

        switch (action) {
            case "keep":
                await this.Keep(interaction);
                break;
            default:
                await interaction.reply("Invalid action");
                AppLogger.LogError("Button/Multidrop", `Invalid action, ${action}`);
        }
    }

    public async Keep(interaction: ButtonInteraction) {
        const cardNumber = interaction.customId.split(" ")[2];
        let cardsRemaining = Number(interaction.customId.split(" ")[3]) || 0;
        const userId = interaction.customId.split(" ")[4];

        if (interaction.user.id != userId) {
            await interaction.reply("You're not the user this drop was made for!");
            return;
        }

        const card = CardDropHelperMetadata.GetCardByCardNumber(cardNumber);

        if (!card) {
            await interaction.reply("Unable to find card.");
            AppLogger.LogWarn("Button/Multidrop/Keep", `Card not found, ${cardNumber}`);
            return;
        }

        if (cardsRemaining < 0) {
            await interaction.reply("Your multidrop has ran out! Please buy a new one!");
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

            await interaction.update({ embeds: [ embed ]});
            return;
        }

        // Drop next card
        cardsRemaining -= 1;

        await interaction.deferUpdate();

        try {
            const image = readFileSync(path.join(process.env.DATA_DIR!, "cards", ))
        }
    }
}