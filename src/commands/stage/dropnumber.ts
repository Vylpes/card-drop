import { AttachmentBuilder, CacheType, CommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../../type/command";
import { readFileSync } from "fs";
import Inventory from "../../database/entities/app/Inventory";
import { v4 } from "uuid";
import { CoreClient } from "../../client/client";
import path from "path";
import CardDropHelperMetadata from "../../helpers/CardDropHelperMetadata";
import AppLogger from "../../client/appLogger";

export default class Dropnumber extends Command {
    constructor() {
        super();

        this.CommandBuilder = new SlashCommandBuilder()
            .setName("dropnumber")
            .setDescription("(TEST) Summon a specific card")
            .addStringOption(x =>
                x
                    .setName("cardnumber")
                    .setDescription("The card number to summon")
                    .setRequired(true));
    }

    public override async execute(interaction: CommandInteraction<CacheType>) {
        if (!interaction.isChatInputCommand()) return;

        const cardNumber = interaction.options.get("cardnumber");

        if (!cardNumber || !cardNumber.value) {
            await interaction.reply("Card Number is required");
            return;
        }

        const card = CoreClient.Cards
            .flatMap(x => x.cards)
            .find(x => x.id == cardNumber.value);

        if (!card) {
            await interaction.reply("Card not found");
            return;
        }

        const series = CoreClient.Cards
            .find(x => x.cards.includes(card))!;

        const claimId = v4();


        await interaction.deferReply();

        try {
            const files = [];
            let imageFileName = "";

            if (!(card.path.startsWith("http://") || card.path.startsWith("https://"))) {
                const image = readFileSync(path.join(process.env.DATA_DIR!, "cards", card.path));
                imageFileName = card.path.split("/").pop()!;

                const attachment = new AttachmentBuilder(image, { name: imageFileName });

                files.push(attachment);
            }

            const inventory = await Inventory.FetchOneByCardNumberAndUserId(interaction.user.id, card.id);
            const quantityClaimed = inventory ? inventory.Quantity : 0;

            const embed = CardDropHelperMetadata.GenerateDropEmbed({ card, series }, quantityClaimed, imageFileName);

            const row = CardDropHelperMetadata.GenerateDropButtons({ card, series }, claimId, interaction.user.id);

            await interaction.editReply({
                embeds: [ embed ],
                files: files,
                components: [ row ],
            });
        } catch (e) {
            AppLogger.CatchError("Dropnumber", e);
            await interaction.editReply("Unable to send next drop. Please try again, and report this if it keeps happening");
        }

        CoreClient.ClaimId = claimId;
    }
}