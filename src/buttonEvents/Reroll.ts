import { AttachmentBuilder, ButtonInteraction } from "discord.js";
import { ButtonEvent } from "../type/buttonEvent";
import { readFileSync } from "fs";
import { v4 } from "uuid";
import { CoreClient } from "../client/client";
import Inventory from "../database/entities/app/Inventory";
import Config from "../database/entities/app/Config";
import path from "path";
import AppLogger from "../client/appLogger";
import User from "../database/entities/app/User";
import CardConstants from "../constants/CardConstants";
import GetCardsHelper from "../helpers/DropHelpers/GetCardsHelper";
import DropEmbedHelper from "../helpers/DropHelpers/DropEmbedHelper";

export default class Reroll extends ButtonEvent {
    public override async execute(interaction: ButtonInteraction) {
        if (!CoreClient.AllowDrops) {
            await interaction.reply("Bot is currently syncing, please wait until its done.");
            return;
        }

        if (await Config.GetValue("safemode") == "true") {
            AppLogger.LogWarn("Button/Reroll", "Safe Mode is active, refusing to send next drop.");

            await interaction.reply("Safe Mode has been activated, please resync to continue.");
            return;
        }

        let user = await User.FetchOneById(User, interaction.user.id);

        if (!user) {
            user = new User(interaction.user.id, CardConstants.StartingCurrency);
            await user.Save(User, user);

            AppLogger.LogInfo("Commands/Drop", `New user (${interaction.user.id}) saved to the database`);
        }

        if (!user.RemoveCurrency(CardConstants.ClaimCost)) {
            await interaction.reply(`Not enough currency! You need ${CardConstants.ClaimCost} currency, you have ${user.Currency}!`);
            return;
        }

        await user.Save(User, user);

        const randomCard = await GetCardsHelper.FetchCard(interaction.user.id);

        if (!randomCard) {
            await interaction.reply("Unable to fetch card, please try again.");
            return;
        }

        await interaction.deferReply();

        try {
            AppLogger.LogVerbose("Button/Reroll", `Sending next drop: ${randomCard.card.id} (${randomCard.card.name})`);

            const files = [];
            let imageFileName = "";

            if (!(randomCard.card.path.startsWith("http://") || randomCard.card.path.startsWith("https://"))) {
                const image = readFileSync(path.join(process.env.DATA_DIR!, "cards", randomCard.card.path));
                imageFileName = randomCard.card.path.split("/").pop()!;

                const attachment = new AttachmentBuilder(image, { name: imageFileName });

                files.push(attachment);
            }

            const inventory = await Inventory.FetchOneByCardNumberAndUserId(interaction.user.id, randomCard.card.id);
            const quantityClaimed = inventory ? inventory.Quantity : 0;

            const embed = DropEmbedHelper.GenerateDropEmbed(randomCard, quantityClaimed, imageFileName, undefined, user.Currency);

            const claimId = v4();

            const row = DropEmbedHelper.GenerateDropButtons(randomCard, claimId, interaction.user.id);

            await interaction.editReply({
                embeds: [ embed ],
                files: files,
                components: [ row ],
            });
        } catch (e) {
            AppLogger.LogError("Button/Reroll", `Error sending next drop for card ${randomCard.card.id}: ${e}`);

            await interaction.editReply(`Unable to send next drop. Please try again, and report this if it keeps happening. (${randomCard.card.id})`);
        }
    }
}
