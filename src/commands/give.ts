import { CacheType, CommandInteraction, PermissionsBitField, SlashCommandBuilder } from "discord.js";
import { Command } from "../type/command";
import { CoreClient } from "../client/client";
import Config from "../database/entities/app/Config";
import CardDropHelperMetadata from "../helpers/CardDropHelperMetadata";
import Inventory from "../database/entities/app/Inventory";
import AppLogger from "../client/appLogger";

export default class Give extends Command {
    constructor() {
        super();

        this.CommandBuilder = new SlashCommandBuilder()
            .setName("give")
            .setDescription("Give a user a card manually, in case bot breaks")
            .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
            .addStringOption(x =>
                x
                    .setName("cardnumber")
                    .setDescription("G")
                    .setRequired(true))
            .addUserOption(x =>
                x
                    .setName("user")
                    .setDescription("The user to give the card to")
                    .setRequired(true));
    }

    public override async execute(interaction: CommandInteraction<CacheType>) {
        if (!CoreClient.AllowDrops) {
            await interaction.reply("Bot is currently syncing, please wait until its done.");
            return;
        }

        if (await Config.GetValue("safemode") == "true") {
            await interaction.reply("Safe Mode has been activated, please resync to continue.");
            return;
        }

        const whitelistedUsers = process.env.BOT_ADMINS!.split(",");

        if (!whitelistedUsers.find(x => x == interaction.user.id)) {
            await interaction.reply("Only whitelisted users can use this command.");
            return;
        }

        const cardNumber = interaction.options.get("cardnumber", true);
        const user = interaction.options.getUser("user", true);

        AppLogger.LogSilly("Commands/Give", `Parameters: cardNumber=${cardNumber.value}, user=${user.id}`);

        const card = CardDropHelperMetadata.GetCardByCardNumber(cardNumber.value!.toString());

        if (!card) {
            await interaction.reply("Unable to fetch card, please try again.");
            return;
        }

        let inventory = await Inventory.FetchOneByCardNumberAndUserId(user.id, card.card.id);

        if (!inventory) {
            inventory = new Inventory(user.id, card.card.id, 1);
        } else {
            inventory.SetQuantity(inventory.Quantity + 1);
        }

        await inventory.Save(Inventory, inventory);

        await interaction.reply(`${card.card.name} given to ${user.username}, they now have ${inventory.Quantity}`);
    }
}