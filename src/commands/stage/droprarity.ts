import { AttachmentBuilder, CacheType, CommandInteraction, DiscordAPIError, SlashCommandBuilder } from "discord.js";
import { Command } from "../../type/command";
import { CardRarity, CardRarityParse } from "../../constants/CardRarity";
import { readFileSync } from "fs";
import Inventory from "../../database/entities/app/Inventory";
import { v4 } from "uuid";
import { CoreClient } from "../../client/client";
import path from "path";
import GetCardsHelper from "../../helpers/DropHelpers/GetCardsHelper";
import DropEmbedHelper from "../../helpers/DropHelpers/DropEmbedHelper";

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

        const card = await GetCardsHelper.GetRandomCardByRarity(rarityType);

        if (!card) {
            await interaction.reply("Card not found");
            return;
        }

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

        const embed = DropEmbedHelper.GenerateDropEmbed(card, quantityClaimed, imageFileName);

        const claimId = v4();

        const row = DropEmbedHelper.GenerateDropButtons(card, claimId, interaction.user.id);

        try {
            await interaction.editReply({
                embeds: [ embed ],
                files: files,
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