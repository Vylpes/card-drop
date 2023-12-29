import { AttachmentBuilder, CommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../type/command";
import { readFileSync } from "fs";
import { CoreClient } from "../client/client";
import { v4 } from "uuid";
import Inventory from "../database/entities/app/Inventory";
import Config from "../database/entities/app/Config";
import CardDropHelperMetadata from "../helpers/CardDropHelperMetadata";
import path from "path";

export default class Drop extends Command {
    constructor() {
        super();

        super.CommandBuilder = new SlashCommandBuilder()
            .setName('drop')
            .setDescription('Summon a new card drop');
    }

    public override async execute(interaction: CommandInteraction) {
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

        try {
            let image: Buffer;
            const imageFileName = randomCard.card.path.split("/").pop()!;

            image = readFileSync(path.join(process.env.DATA_DIR!, 'cards', randomCard.card.path));

            await interaction.deferReply();

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
            console.error(e);

            await interaction.editReply(`Unable to send next drop. Please try again, and report this if it keeps happening. (${randomCard.card.id})`);
        }

    }
}