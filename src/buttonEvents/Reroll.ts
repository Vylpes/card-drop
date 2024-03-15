import { AttachmentBuilder, ButtonInteraction } from "discord.js";
import { ButtonEvent } from "../type/buttonEvent";
import { readFileSync } from "fs";
import { v4 } from "uuid";
import { CoreClient } from "../client/client";
import Inventory from "../database/entities/app/Inventory";
import Config from "../database/entities/app/Config";
import CardDropHelperMetadata from "../helpers/CardDropHelperMetadata";
import path from "path";
import AppLogger from "../client/appLogger";

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

        const randomCard = CardDropHelperMetadata.GetRandomCard();

        if (!randomCard) {
            await interaction.reply("Unable to fetch card, please try again.");
            return;
        }

        await interaction.deferReply();

        try {
            AppLogger.LogVerbose("Button/Reroll", `Sending next drop: ${randomCard.card.id} (${randomCard.card.name})`);

            const image = readFileSync(path.join(process.env.DATA_DIR!, "cards", randomCard.card.path));
            const imageFileName = randomCard.card.path.split("/").pop()!;

            const attachment = new AttachmentBuilder(image, { name: imageFileName });

            const inventory = await Inventory.FetchOneByCardNumberAndUserId(interaction.user.id, randomCard.card.id);
            const quantityClaimed = inventory ? inventory.Quantity : 0;

            const embed = CardDropHelperMetadata.GenerateDropEmbed(randomCard, quantityClaimed, imageFileName);

            const claimId = v4();

            const row = CardDropHelperMetadata.GenerateDropButtons(randomCard, claimId, interaction.user.id);

            await interaction.editReply({
                embeds: [ embed ],
                files: [ attachment ],
                components: [ row ],
            });

            CoreClient.ClaimId = claimId;
        } catch (e) {
            AppLogger.LogError("Button/Reroll", `Error sending next drop for card ${randomCard.card.id}: ${e}`);

            await interaction.editReply(`Unable to send next drop. Please try again, and report this if it keeps happening. (${randomCard.card.id})`);
        }
    }
}