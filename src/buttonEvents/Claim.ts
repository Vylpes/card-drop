import { ButtonInteraction } from "discord.js";
import { ButtonEvent } from "../type/buttonEvent";
import Inventory from "../database/entities/app/Inventory";
import { CoreClient } from "../client/client";

export default class Claim extends ButtonEvent {
    public override async execute(interaction: ButtonInteraction) {
        if (!interaction.guild || !interaction.guildId) return;

        const cardNumber = interaction.customId.split(' ')[1];
        const claimId = interaction.customId.split(' ')[2];
        const userId = interaction.user.id;

        const claimed = await Inventory.FetchOneByClaimId(claimId);

        if (claimed) {
            await interaction.reply('This card has already been claimed');
            return;
        }

        if (claimId != CoreClient.ClaimId) {
            await interaction.reply('This card has expired');
            return;
        }

        let inventory = await Inventory.FetchOneByCardNumberAndUserId(userId, cardNumber);

        if (!inventory) {
            inventory = new Inventory(userId, cardNumber, 1, claimId);
        } else {
            inventory.SetQuantity(inventory.Quantity + 1);
        }

        await inventory.Save(Inventory, inventory);

        await interaction.reply('Card claimed');
    }
}