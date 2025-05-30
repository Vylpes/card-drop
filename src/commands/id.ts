import { AttachmentBuilder, CommandInteraction, DiscordAPIError, SlashCommandBuilder } from "discord.js";
import { Command } from "../type/command";
import { CoreClient } from "../client/client";
import { readFileSync } from "fs";
import path from "path";
import Inventory from "../database/entities/app/Inventory";
import AppLogger from "../client/appLogger";
import DropEmbedHelper from "../helpers/DropHelpers/DropEmbedHelper";

export default class Id extends Command {
    constructor() {
        super();

        this.CommandBuilder = new SlashCommandBuilder()
            .setName("id")
            .setDescription("View a specific command by its id")
            .addStringOption(x =>
                x
                    .setName("cardnumber")
                    .setDescription("The card number to view")
                    .setRequired(true));
    }

    public override async execute(interaction: CommandInteraction) {
        const cardNumber = interaction.options.get("cardnumber");

        AppLogger.LogSilly("Commands/View", `Parameters: cardNumber=${cardNumber?.value}`);

        if (!cardNumber || !cardNumber.value) {
            await interaction.reply("Card number is required.");
            return;
        }

        const card = CoreClient.Cards
            .flatMap(x => x.cards)
            .find(x => x.id == cardNumber.value);

        if (!card) {
            await interaction.reply("Card not found.");
            return;
        }

        const series = CoreClient.Cards
            .find(x => x.cards.includes(card))!;

        const files = [];
        let imageFileName = "";

        if (!(card.path.startsWith("http://") || card.path.startsWith("https://"))) {
            const image = readFileSync(path.join(process.env.DATA_DIR!, "cards", card.path));
            imageFileName = card.path.split("/").pop()!;

            const attachment = new AttachmentBuilder(image, { name: imageFileName });

            files.push(attachment);
        }

        await interaction.deferReply();

        const inventory = await Inventory.FetchOneByCardNumberAndUserId(interaction.user.id, card.id);
        const quantityClaimed = inventory ? inventory.Quantity : 0;

        const embed = DropEmbedHelper.GenerateDropEmbed({ card, series }, quantityClaimed, imageFileName);

        try {
            await interaction.editReply({
                embeds: [ embed ],
                files: files,
            });
        } catch (e) {
            AppLogger.LogError("Commands/View", `Error sending view for card ${card.id}: ${e}`);

            if (e instanceof DiscordAPIError) {
                await interaction.editReply(`Unable to send next drop. Please try again, and report this if it keeps happening. Code: ${e.code}.`);
            } else {
                await interaction.editReply("Unable to send next drop. Please try again, and report this if it keeps happening. Code: UNKNOWN.");
            }
        }
    }
}
