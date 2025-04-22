import { AttachmentBuilder, CacheType, CommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../../type/command";
import { CardRarity, CardRarityChoices, CardRarityParse } from "../../constants/CardRarity";
import { readFileSync } from "fs";
import Inventory from "../../database/entities/app/Inventory";
import { v4 } from "uuid";
import { CoreClient } from "../../client/client";
import CardDropHelperMetadata from "../../helpers/CardDropHelperMetadata";
import path from "path";
import AppLogger from "../../client/appLogger";

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
                    .setRequired(true)
                    .setChoices(CardRarityChoices));
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

        const card = CardDropHelperMetadata.GetRandomCardByRarity(rarityType);

        if (!card) {
            await interaction.reply("Card not found");
            return;
        }

        const claimId = v4();

        await interaction.deferReply();

        try {
            const files = [];
            let imageFileName = "";

            if (!(card.card.path.startsWith("http://") || card.card.path.startsWith("https://"))) {
                const image = readFileSync(path.join(process.env.DATA_DIR!, "cards", card.card.path));
                imageFileName = card.card.path.split("/").pop()!;

                const attachment = new AttachmentBuilder(image, { name: imageFileName });

                files.push(attachment);
            }

            const inventory = await Inventory.FetchOneByCardNumberAndUserId(interaction.user.id, card.card.id);
            const quantityClaimed = inventory ? inventory.Quantity : 0;

            const embed = CardDropHelperMetadata.GenerateDropEmbed(card, quantityClaimed, imageFileName);

            const row = CardDropHelperMetadata.GenerateDropButtons(card, claimId, interaction.user.id);

            await interaction.editReply({
                embeds: [ embed ],
                files: files,
                components: [ row ],
            });
        } catch (e) {
            AppLogger.CatchError("Droprarity", e);
            await interaction.editReply("Unable to send next drop. Please try again, and report this if it keeps happening");
        }

        CoreClient.ClaimId = claimId;
    }
}