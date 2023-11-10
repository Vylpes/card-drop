import { AttachmentBuilder, CommandInteraction, DiscordAPIError, SlashCommandBuilder } from "discord.js";
import { Command } from "../type/command";
import CardDropHelper from "../helpers/CardDropHelper";
import { readFileSync } from "fs";
import { CoreClient } from "../client/client";
import { v4 } from "uuid";
import Card from "../database/entities/card/Card";
import Inventory from "../database/entities/app/Inventory";

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

        const randomCard = await CardDropHelper.GetRandomCard();

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