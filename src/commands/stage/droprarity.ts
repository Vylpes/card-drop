import { AttachmentBuilder, CacheType, CommandInteraction, DiscordAPIError, SlashCommandBuilder } from "discord.js";
import { Command } from "../../type/command";
import { CardRarity, CardRarityParse } from "../../constants/CardRarity";
import { readFileSync } from "fs";
import Inventory from "../../database/entities/app/Inventory";
import { v4 } from "uuid";
import { CoreClient } from "../../client/client";
import CardDropHelperMetadata from "../../helpers/CardDropHelperMetadata";
import path from "path";

export default class Droprarity extends Command {
    constructor() {
        super();

        this.CommandBuilder = new SlashCommandBuilder()
            .setName("droprarity")
            .setDescription("(TEST) Summon a random card of a specific rarity")
            .addStringOption(x =>
                x
                    .setName("rarity")
                    .setDescription("The rarity you want to summon")
                    .setRequired(true));
    }

    public override async execute(interaction: CommandInteraction<CacheType>) {
        if (!interaction.isChatInputCommand()) return;

        const rarity = interaction.options.get("rarity");

        if (!rarity || !rarity.value) {
            await interaction.reply("Rarity is required");
            return;
        }

        const rarityType = CardRarityParse(rarity.value.toString());

        if (rarityType == CardRarity.Unknown) {
            await interaction.reply("Invalid rarity");
            return;
        }

        const card = await CardDropHelperMetadata.GetRandomCardByRarity(rarityType);

        if (!card) {
            await interaction.reply("Card not found");
            return;
        }

        let image: Buffer;
        const imageFileName = card.card.path.split("/").pop()!;

        try {
            image = readFileSync(path.join(process.env.DATA_DIR!, "cards", card.card.path));
        } catch {
            await interaction.reply(`Unable to fetch image for card ${card.card.id}`);
            return;
        }

        await interaction.deferReply();

        const attachment = new AttachmentBuilder(image, { name: imageFileName });

        const inventory = await Inventory.FetchOneByCardNumberAndUserId(interaction.user.id, card.card.id);
        const quantityClaimed = inventory ? inventory.Quantity : 0;

        const embed = CardDropHelperMetadata.GenerateDropEmbed(card, quantityClaimed, imageFileName);

        const claimId = v4();

        const row = CardDropHelperMetadata.GenerateDropButtons(card, claimId, interaction.user.id);

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
                await interaction.editReply("Unable to send next drop. Please try again, and report this if it keeps happening. Code: UNKNOWN");
            }
        }

        CoreClient.ClaimId = claimId;
    }
}