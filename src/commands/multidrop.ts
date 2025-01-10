import { AttachmentBuilder, CommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../type/command";
import { CoreClient } from "../client/client";
import ErrorMessages from "../constants/ErrorMessages";
import Config from "../database/entities/app/Config";
import AppLogger from "../client/appLogger";
import User from "../database/entities/app/User";
import CardConstants from "../constants/CardConstants";
import { readFileSync } from "fs";
import path from "path";
import Inventory from "../database/entities/app/Inventory";
import GetCardsHelper from "../helpers/DropHelpers/GetCardsHelper";
import MultidropEmbedHelper from "../helpers/DropHelpers/MultidropEmbedHelper";

export default class Multidrop extends Command {
    constructor() {
        super();

        this.CommandBuilder = new SlashCommandBuilder()
            .setName("multidrop")
            .setDescription("Drop 11 cards for the price of 10!");
    }

    public override async execute(interaction: CommandInteraction) {
        if (!CoreClient.AllowDrops) {
            await interaction.reply(ErrorMessages.BotSyncing);
            return;
        }

        if (await Config.GetValue("safemode") == "true") {
            AppLogger.LogWarn("Commands/Multidrop", ErrorMessages.SafeMode);
            await interaction.reply(ErrorMessages.SafeMode);
            return;
        }

        let user = await User.FetchOneById(User, interaction.user.id);

        if (!user) {
            user = new User(interaction.user.id, CardConstants.StartingCurrency);
            await user.Save(User, user);

            AppLogger.LogInfo("Commands/Multidrop", `New user (${interaction.user.id}) saved to the database`);
        }

        if (user.Currency < CardConstants.MultidropCost) {
            await interaction.reply(ErrorMessages.NotEnoughCurrency(CardConstants.MultidropCost, user.Currency));
            return;
        }

        user.RemoveCurrency(CardConstants.MultidropCost);
        await user.Save(User, user);

        const randomCard = GetCardsHelper.GetRandomCard();
        const cardsRemaining = CardConstants.MultidropQuantity - 1;

        if (!randomCard) {
            AppLogger.LogWarn("Commands/Multidrop", ErrorMessages.UnableToFetchCard);
            await interaction.reply(ErrorMessages.UnableToFetchCard);
            return;
        }

        await interaction.deferReply();

        try {
            const image = readFileSync(path.join(process.env.DATA_DIR!, "cards", randomCard.card.path));
            const imageFileName = randomCard.card.path.split("/").pop()!;

            const attachment = new AttachmentBuilder(image, { name: imageFileName });

            const inventory = await Inventory.FetchOneByCardNumberAndUserId(interaction.user.id, randomCard.card.id);
            const quantityClaimed = inventory ? inventory.Quantity : 0;

            const embed = MultidropEmbedHelper.GenerateMultidropEmbed(randomCard, quantityClaimed, imageFileName, cardsRemaining, undefined, user.Currency);

            const row = MultidropEmbedHelper.GenerateMultidropButtons(randomCard, cardsRemaining, interaction.user.id);

            await interaction.editReply({
                embeds: [ embed ],
                files: [ attachment ],
                components: [ row ],
            });
        } catch (e) {
            AppLogger.LogError("Commands/Multidrop", `Error sending next drop for card ${randomCard.card.id}: ${e}`);

            await interaction.editReply(`Unable to send next drop. Please try again, and report this if it keeps happening. (${randomCard.card.id})`);
        }
    }
}