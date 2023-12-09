import { AttachmentBuilder, ButtonInteraction, DiscordAPIError } from "discord.js";
import { ButtonEvent } from "../type/buttonEvent";
import { readFileSync } from "fs";
import { v4 } from "uuid";
import { CoreClient } from "../client/client";
import Inventory from "../database/entities/app/Inventory";
import Config from "../database/entities/app/Config";
import CardDropHelperMetadata from "../helpers/CardDropHelperMetadata";
import path from "path";

export default class Reroll extends ButtonEvent {
    public override async execute(interaction: ButtonInteraction) {
        if (!CoreClient.AllowDrops) {
            await interaction.reply('Bot is currently syncing, please wait until its done.');
            return;
        }

        if (await Config.GetValue('safemode') == "true") {
            await interaction.reply('Safe Mode has been activated, please resync to continue.');
            return;
        }

        const randomCard = CardDropHelperMetadata.GetRandomCard();

        if (!randomCard) {
            await interaction.reply('Unable to fetch card, please try again.');
            return;
        }

        let image: Buffer;
        const imageFileName = randomCard.card.path.split("/").pop()!;

        try {
            image = readFileSync(path.join(process.cwd(), 'cards', randomCard.card.path));
        } catch {
            await interaction.reply(`Unable to fetch image for card ${randomCard.card.id}`);
            return;
        }

        await interaction.deferReply();

        const attachment = new AttachmentBuilder(image, { name: imageFileName });

        const inventory = await Inventory.FetchOneByCardNumberAndUserId(interaction.user.id, randomCard.card.id);
        const quantityClaimed = inventory ? inventory.Quantity : 0;

        const embed = CardDropHelperMetadata.GenerateDropEmbed(randomCard, quantityClaimed, imageFileName);

        const claimId = v4();

        const row = CardDropHelperMetadata.GenerateDropButtons(randomCard, claimId, interaction.user.id);

        try {
            await interaction.editReply({
                embeds: [ embed ],
                files: [ attachment ],
                components: [ row ],
            });
        } catch (e) {
            console.error(e);

            if (e instanceof DiscordAPIError) {
                await interaction.editReply(`Unable to send next drop. Please try again, and report this if it keeps happening. Code: ${e.code}`);
            } else {
                await interaction.editReply(`Unable to send next drop. Please try again, and report this if it keeps happening. Code: UNKNOWN`);
            }
        }

        CoreClient.ClaimId = claimId;
    }
}