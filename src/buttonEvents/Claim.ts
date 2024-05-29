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

        await interaction.deferUpdate();

        const cardNumber = interaction.customId.split(" ")[1];
        const claimId = interaction.customId.split(" ")[2];
        const droppedBy = interaction.customId.split(" ")[3];
        const userId = interaction.user.id;

        AppLogger.LogSilly("Button/Claim", `Parameters: cardNumber=${cardNumber}, claimId=${claimId}, droppedBy=${droppedBy}, userId=${userId}`);

        const claimed = await eClaim.FetchOneByClaimId(claimId);

        if (claimed) {
            await interaction.reply("This card has already been claimed");
            return;
        }

        if (claimId == CoreClient.ClaimId && userId != droppedBy) {
            await interaction.reply("The latest dropped card can only be claimed by the user who dropped it");
            return;
        }

        let inventory = await Inventory.FetchOneByCardNumberAndUserId(userId, cardNumber);

        if (!inventory) {
            inventory = new Inventory(userId, cardNumber, 1);
        } else {
            inventory.SetQuantity(inventory.Quantity + 1);
        }

        await inventory.Save(Inventory, inventory);

        const user = await User.FetchOneById(User, userId) || new User(userId, CardConstants.StartingCurrency);

        AppLogger.LogSilly("Button/Claim", `${user.Id} has ${user.Currency} currency`);

        if (!user.RemoveCurrency(CardConstants.ClaimCost)) {
            await interaction.reply(`Not enough currency! You need 10 currency, you have ${user.Currency}`);
            return;
        }

        await user.Save(User, user);

        const claim = new eClaim(claimId);
        claim.SetInventory(inventory);

        await claim.Save(eClaim, claim);

        const card = CardDropHelperMetadata.GetCardByCardNumber(cardNumber);

        if (!card) {
            return;
        }

        const imageFileName = card.card.path.split("/").pop()!;

        const embed = CardDropHelperMetadata.GenerateDropEmbed(card, inventory.Quantity, imageFileName, interaction.user.username);
        const row = CardDropHelperMetadata.GenerateDropButtons(card, claimId, interaction.user.id, true);

        await interaction.editReply({
            embeds: [ embed ],
            components: [ row ],
        });
    }
}