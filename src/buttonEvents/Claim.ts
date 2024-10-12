import { ButtonInteraction } from "discord.js";
import { ButtonEvent } from "../type/buttonEvent";
import Inventory from "../database/entities/app/Inventory";
import { CoreClient } from "../client/client";
import { default as eClaim } from "../database/entities/app/Claim";
import AppLogger from "../client/appLogger";
import CardDropHelperMetadata from "../helpers/CardDropHelperMetadata";
import User from "../database/entities/app/User";
import CardConstants from "../constants/CardConstants";

export default class Claim extends ButtonEvent {
    public override async execute(interaction: ButtonInteraction) {
        if (!interaction.guild || !interaction.guildId) return;
        if (!interaction.channel) return;

        await interaction.deferUpdate();

        const cardNumber = interaction.customId.split(" ")[1];
        const claimId = interaction.customId.split(" ")[2];
        const droppedBy = interaction.customId.split(" ")[3];
        const userId = interaction.user.id;

        const whenDropped = interaction.message.createdAt;
        const lastClaimableDate = new Date(Date.now() - (1000 * 60 * 5)); // 5 minutes ago

        if (whenDropped < lastClaimableDate) {
            await interaction.channel.send(`${interaction.user}, Cards can only be claimed within 5 minutes of it being dropped!`);
            return;
        }

        AppLogger.LogSilly("Button/Claim", `Parameters: cardNumber=${cardNumber}, claimId=${claimId}, droppedBy=${droppedBy}, userId=${userId}`);

        const user = await User.FetchOneById(User, userId) || new User(userId, CardConstants.StartingCurrency);

        AppLogger.LogSilly("Button/Claim", `${user.Id} has ${user.Currency} currency`);

        if (!user.RemoveCurrency(CardConstants.ClaimCost)) {
            await interaction.channel.send(`${interaction.user}, Not enough currency! You need ${CardConstants.ClaimCost} currency, you have ${user.Currency}!`);
            return;
        }

        const claimed = await eClaim.FetchOneByClaimId(claimId);

        if (claimed) {
            await interaction.channel.send(`${interaction.user}, This card has already been claimed!`);
            return;
        }

        if (claimId == CoreClient.ClaimId && userId != droppedBy) {
            await interaction.channel.send(`${interaction.user}, The latest dropped card can only be claimed by the user who dropped it!`);
            return;
        }

        await user.Save(User, user);

        let inventory = await Inventory.FetchOneByCardNumberAndUserId(userId, cardNumber);

        if (!inventory) {
            inventory = new Inventory(userId, cardNumber, 1);
        } else {
            inventory.AddQuantity(1);
        }

        await inventory.Save(Inventory, inventory);

        const claim = new eClaim(claimId);
        claim.SetInventory(inventory);

        await claim.Save(eClaim, claim);

        const card = CardDropHelperMetadata.GetCardByCardNumber(cardNumber);

        if (!card) {
            return;
        }

        const imageFileName = card.card.path.split("/").pop()!;

        const embed = CardDropHelperMetadata.GenerateDropEmbed(card, inventory.Quantity, imageFileName, interaction.user.username, user.Currency);
        const row = CardDropHelperMetadata.GenerateDropButtons(card, claimId, interaction.user.id, true);

        await interaction.editReply({
            embeds: [ embed ],
            components: [ row ],
        });
    }
}
