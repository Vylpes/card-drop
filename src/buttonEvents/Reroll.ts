import { AttachmentBuilder, ButtonInteraction, DiscordAPIError } from "discord.js";
import { ButtonEvent } from "../type/buttonEvent";
import CardDropHelper from "../helpers/CardDropHelper";
import { readFileSync } from "fs";
import { v4 } from "uuid";
import { CoreClient } from "../client/client";
import Inventory from "../database/entities/app/Inventory";
import Config from "../database/entities/app/Config";

export default class Reroll extends ButtonEvent {
    public override async execute(interaction: ButtonInteraction) {
        if (!CoreClient.AllowDrops) {
            await interaction.reply('Bot is currently syncing, please wait until its done.');
            return;
        }

        if (await Config.GetValue('safemode') == "true")
        {
            await interaction.reply('Safe Mode has been activated, please resync to contunue.');
            return;
        }

        if (!interaction.guild || !interaction.guildId) return;

        let randomCard = await CardDropHelper.GetRandomCard();

        if (process.env.DROP_RARITY && Number(process.env.DROP_RARITY) > 0) {
            randomCard = await CardDropHelper.GetRandomCardByRarity(Number(process.env.DROP_RARITY));
        }

        const image = readFileSync(randomCard.Path);

        await interaction.deferReply();

        const attachment = new AttachmentBuilder(image, { name: randomCard.FileName });

        const inventory = await Inventory.FetchOneByCardNumberAndUserId(interaction.user.id, randomCard.CardNumber);
        const quantityClaimed = inventory ? inventory.Quantity : 0;

        const embed = CardDropHelper.GenerateDropEmbed(randomCard, quantityClaimed || 0);

        const claimId = v4();

        const row = CardDropHelper.GenerateDropButtons(randomCard, claimId, interaction.user.id);

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