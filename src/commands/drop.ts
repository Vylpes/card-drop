import { AttachmentBuilder, CommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../type/command";
import { readFileSync } from "fs";
import { CoreClient } from "../client/client";
import { v4 } from "uuid";
import Inventory from "../database/entities/app/Inventory";
import Config from "../database/entities/app/Config";
import path from "path";
import AppLogger from "../client/appLogger";
import User from "../database/entities/app/User";
import CardConstants from "../constants/CardConstants";
import ErrorMessages from "../constants/ErrorMessages";
import GetCardsHelper from "../helpers/DropHelpers/GetCardsHelper";
import DropEmbedHelper from "../helpers/DropHelpers/DropEmbedHelper";
import {DropResult} from "../contracts/SeriesMetadata";

export default class Drop extends Command {
    constructor() {
        super();

        this.CommandBuilder = new SlashCommandBuilder()
            .setName("drop")
            .setDescription("Summon a new card drop");
    }

    public override async execute(interaction: CommandInteraction) {
        if (!CoreClient.AllowDrops) {
            await interaction.reply(ErrorMessages.BotSyncing);
            return;
        }

        if (await Config.GetValue("safemode") == "true") {
            AppLogger.LogWarn("Commands/Drop", ErrorMessages.SafeMode);
            await interaction.reply(ErrorMessages.SafeMode);
            return;
        }

        let user = await User.FetchOneById(User, interaction.user.id);

        if (!user) {
            user = new User(interaction.user.id, CardConstants.StartingCurrency);
            await user.Save(User, user);

            AppLogger.LogInfo("Commands/Drop", `New user (${interaction.user.id}) saved to the database`);
        }

        if (!user.RemoveCurrency(CardConstants.ClaimCost)) {
            await interaction.reply(ErrorMessages.NotEnoughCurrency(CardConstants.ClaimCost, user.Currency));
            return;
        }

        let randomCard: DropResult | undefined;

        try {
            randomCard = await GetCardsHelper.FetchCard(interaction.user.id);
        } catch (e) {
            AppLogger.CatchError("Commands/Drop", e);

            await interaction.reply(ErrorMessages.UnableToFetchCard);
        }


        if (!randomCard) {
            AppLogger.LogWarn("Commands/Drop", ErrorMessages.UnableToFetchCard);
            await interaction.reply(ErrorMessages.UnableToFetchCard);
            return;
        }

        await interaction.deferReply();

        try {
            const files = [];
            let imageFileName = "";

            if (!(randomCard.card.path.startsWith("http://") || randomCard.card.path.startsWith("https://"))) {
                const image = readFileSync(path.join(process.env.DATA_DIR!, "cards", randomCard.card.path));
                imageFileName = randomCard.card.path.split("/").pop()!;

                const attachment = new AttachmentBuilder(image, { name: imageFileName });

                files.push(attachment);
            }

            const inventory = await Inventory.FetchOneByCardNumberAndUserId(interaction.user.id, randomCard.card.id);
            const quantityClaimed = inventory ? inventory.Quantity : 0;

            const embed = DropEmbedHelper.GenerateDropEmbed(randomCard, quantityClaimed, imageFileName, undefined, user.Currency);

            const claimId = v4();

            const row = DropEmbedHelper.GenerateDropButtons(randomCard, claimId, interaction.user.id);

            await user.Save(User, user);


            await interaction.editReply({
                embeds: [ embed ],
                files: files,
                components: [ row ],
            });

        } catch (e) {
            AppLogger.LogError("Commands/Drop", `Error sending next drop for card ${randomCard.card.id}: ${e}`);

            await interaction.editReply(`Unable to send next drop. Please try again, and report this if it keeps happening. (${randomCard.card.id})`);
        }

    }
}
