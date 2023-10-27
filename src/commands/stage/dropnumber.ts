import { AttachmentBuilder, CacheType, CommandInteraction, DiscordAPIError, SlashCommandBuilder } from "discord.js";
import { Command } from "../../type/command";
import Card from "../../database/entities/card/Card";
import { readFileSync } from "fs";
import Inventory from "../../database/entities/app/Inventory";
import CardDropHelper from "../../helpers/CardDropHelper";
import { v4 } from "uuid";
import { CoreClient } from "../../client/client";

export default class Dropnumber extends Command {
    constructor() {
        super();

        super.CommandBuilder = new SlashCommandBuilder()
            .setName('dropnumber')
            .setDescription('(TEST) Summon a specific card')
            .addStringOption(x =>
                x
                    .setName('cardnumber')
                    .setDescription('The card number to summon')
                    .setRequired(true));
    }

    public override async execute(interaction: CommandInteraction<CacheType>) {
        if (!interaction.isChatInputCommand()) return;

        const cardNumber = interaction.options.get('cardnumber');

        if (!cardNumber || !cardNumber.value) {
            await interaction.reply('Card Number is required');
            return;
        }

        const card = await Card.FetchOneByCardNumber(cardNumber.value.toString(), [
            "Series"
        ]);

        if (!card) {
            await interaction.reply('Card not found');
            return;
        }

        const image = readFileSync(card.Path);

        await interaction.deferReply();

        const attachment = new AttachmentBuilder(image, { name: card.FileName });

        const inventory = await Inventory.FetchOneByCardNumberAndUserId(interaction.user.id, card.CardNumber);
        const quantityClaimed = inventory ? inventory.Quantity : 0;

        const embed = CardDropHelper.GenerateDropEmbed(card, quantityClaimed || 0);

        const claimId = v4();

        const row = CardDropHelper.GenerateDropButtons(card, claimId, interaction.user.id);

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
                await interaction.editReply(`Unable to send next drop. Please try again, and report this if it keeps happening.Code: UNKNOWN`);
            }
        }

        CoreClient.ClaimId = claimId;
    }
}