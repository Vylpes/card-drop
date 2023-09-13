import { ButtonInteraction } from "discord.js";
import { ButtonEvent } from "../type/buttonEvent";
import Inventory from "../database/entities/app/Inventory";
import { CoreClient } from "../client/client";
import { default as eClaim } from "../database/entities/app/Claim";

export default class Claim extends ButtonEvent {
    public override async execute(interaction: ButtonInteraction) {
        if (!interaction.guild || !interaction.guildId) return;

        const cardNumber = interaction.customId.split(' ')[1];
        const claimId = interaction.customId.split(' ')[2];
        const droppedBy = interaction.customId.split(' ')[3];
        const userId = interaction.user.id;

        const claimed = await eClaim.FetchOneByClaimId(claimId);

        if (claimed) {
            await interaction.reply('This card has already been claimed');
            return;
        }

        if (claimId == CoreClient.ClaimId && userId != droppedBy) {
            await interaction.reply('The latest dropped card can only be claimed by the user who dropped it');
            return;
        }

        let inventory = await Inventory.FetchOneByCardNumberAndUserId(userId, cardNumber);

        if (!inventory) {
            inventory = new Inventory(userId, cardNumber, 1);
        } else {
            inventory.SetQuantity(inventory.Quantity + 1);
        }

        await inventory.Save(Inventory, inventory);

        const claim = new eClaim(claimId);
        claim.SetInventory(inventory);

        await claim.Save(eClaim, claim);

        await interaction.reply('Card claimed');
    }
}