import { ButtonInteraction } from "discord.js";
import { ButtonEvent } from "../type/buttonEvent";
import Inventory from "../database/entities/app/Inventory";
import { default as eClaim } from "../database/entities/app/Claim";
import AppLogger from "../client/appLogger";
import User from "../database/entities/app/User";
import CardConstants from "../constants/CardConstants";
import GetCardsHelper from "../helpers/DropHelpers/GetCardsHelper";
import DropEmbedHelper from "../helpers/DropHelpers/DropEmbedHelper";

export default class Claim extends ButtonEvent {
    public override async execute(interaction: ButtonInteraction) {
        if (!interaction.guild || !interaction.guildId) return;
        if (!interaction.channel) return;
        if (!interaction.channel.isSendable()) return;

        await interaction.deferUpdate();

        const cardNumber = interaction.customId.split(" ")[1];
        const claimId = interaction.customId.split(" ")[2];
        const droppedBy = interaction.customId.split(" ")[3];
        const userId = interaction.user.id;

        const whenDropped = interaction.message.createdAt;
        const lastClaimableDate = new Date(Date.now() - (1000 * 60 * 2)); // 2 minutes ago

        if (whenDropped < lastClaimableDate) {
            await interaction.channel.send(`${interaction.user}, Cards can only be claimed within 2 minutes of it being dropped!`);
            return;
        }

        AppLogger.LogSilly("Button/Claim", `Parameters: cardNumber=${cardNumber}, claimId=${claimId}, droppedBy=${droppedBy}, userId=${userId}`);

        const user = await User.FetchOneById(User, userId) || new User(userId, CardConstants.StartingCurrency);

        AppLogger.LogSilly("Button/Claim", `${user.Id} has ${user.Currency} currency`);

        const claimed = await eClaim.FetchOneByClaimId(claimId);

        if (claimed) {
            await interaction.channel.send(`${interaction.user}, This card has already been claimed!`);
            return;
        }

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

        const card = GetCardsHelper.GetCardByCardNumber(cardNumber);

        if (!card) {
            AppLogger.LogError("Button/Claim", `Unable to find card, ${cardNumber}`);

            return;
        }

        const imageFileName = card.card.path.split("/").pop()!;

        const embed = DropEmbedHelper.GenerateDropEmbed(card, inventory.Quantity, imageFileName, interaction.user.username, user.Currency);
        const row = DropEmbedHelper.GenerateDropButtons(card, claimId, interaction.user.id, true);

        await interaction.editReply({
            embeds: [ embed ],
            components: [ row ],
        });
    }
}
