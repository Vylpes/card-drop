import { AttachmentBuilder, CacheType, CommandInteraction, DiscordAPIError, SlashCommandBuilder } from "discord.js";
import { Command } from "../../type/command";
import { CardRarity, CardRarityParse } from "../../constants/CardRarity";
import CardDropHelper from "../../helpers/CardDropHelper";
import { readFileSync } from "fs";
import Inventory from "../../database/entities/app/Inventory";
import { v4 } from "uuid";
import { CoreClient } from "../../client/client";

export default class Droprarity extends Command {
    constructor() {
        super();

        super.CommandBuilder = new SlashCommandBuilder()
            .setName('droprarity')
            .setDescription('(TEST) Summon a random card of a specific rarity')
            .addStringOption(x =>
                x
                    .setName('rarity')
                    .setDescription('The rarity you want to summon')
                    .setRequired(true));
    }

    public override async execute(interaction: CommandInteraction<CacheType>) {
        if (!interaction.isChatInputCommand()) return;

        const rarity = interaction.options.get('rarity');

        if (!rarity || !rarity.value) {
            await interaction.reply('Rarity is required');
            return;
        }

        const rarityType = CardRarityParse(rarity.value.toString());

        if (rarityType == CardRarity.Unknown) {
            await interaction.reply('Invalid rarity');
            return;
        }

        const card = await CardDropHelper.GetRandomCardByRarity(rarityType);

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
                await interaction.editReply(`Unable to send next drop. Please try again, and report this if it keeps happening. Code: UNKNOWN`);
            }
        }

        CoreClient.ClaimId = claimId;
    }
}