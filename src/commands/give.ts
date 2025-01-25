import { CacheType, CommandInteraction, PermissionsBitField, SlashCommandBuilder } from "discord.js";
import { Command } from "../type/command";
import { CoreClient } from "../client/client";
import Config from "../database/entities/app/Config";
import Inventory from "../database/entities/app/Inventory";
import AppLogger from "../client/appLogger";
import User from "../database/entities/app/User";
import GetCardsHelper from "../helpers/DropHelpers/GetCardsHelper";

export default class Give extends Command {
    constructor() {
        super();

        this.CommandBuilder = new SlashCommandBuilder()
            .setName("give")
            .setDescription("Give a user a card manually, in case bot breaks")
            .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
            .addSubcommand(x =>
                x
                    .setName("card")
                    .setDescription("Give a user a card manually")
                    .addStringOption(x =>
                        x
                            .setName("cardnumber")
                            .setDescription("The card to give")
                            .setRequired(true))
                    .addUserOption(x =>
                        x
                            .setName("user")
                            .setDescription("The user to give the card to")
                            .setRequired(true)))
            .addSubcommand(x =>
                x
                    .setName("currency")
                    .setDescription("Give a user currency manually")
                    .addNumberOption(x =>
                        x
                            .setName("amount")
                            .setDescription("The amount to give")
                            .setRequired(true))
                    .addUserOption(x =>
                        x
                            .setName("user")
                            .setDescription("The user to give the currency to")
                            .setRequired(true)));
    }

    public override async execute(interaction: CommandInteraction<CacheType>) {
        if (!interaction.isChatInputCommand()) return;

        const whitelistedUsers = process.env.BOT_ADMINS!.split(",");

        if (!whitelistedUsers.find(x => x == interaction.user.id)) {
            await interaction.reply("Only whitelisted users can use this command.");
            return;
        }

        switch (interaction.options.getSubcommand()) {
        case "card":
            await this.GiveCard(interaction);
            break;
        case "currency":
            await this.GiveCurrency(interaction);
            break;
        }
    }

    private async GiveCard(interaction: CommandInteraction) {
        if (!CoreClient.AllowDrops) {
            await interaction.reply("Bot is currently syncing, please wait until its done.");
            return;
        }

        if (await Config.GetValue("safemode") == "true") {
            await interaction.reply("Safe Mode has been activated, please resync to continue.");
            return;
        }

        const cardNumber = interaction.options.get("cardnumber", true);
        const user = interaction.options.get("user", true).user!;

        AppLogger.LogSilly("Commands/Give/GiveCard", `Parameters: cardNumber=${cardNumber.value}, user=${user.id}`);

        const card = GetCardsHelper.GetCardByCardNumber(cardNumber.value!.toString());

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

        await interaction.reply(`Card ${card.card.name} given to ${user.username}, they now have ${inventory.Quantity}`);
    }

    private async GiveCurrency(interaction: CommandInteraction) {
        const amount = interaction.options.get("amount", true);
        const user = interaction.options.get("user", true).user!;

        AppLogger.LogSilly("Commands/Give/GiveCurrency", `Parameters: amount=${amount.value} user=${user.id}`);

        const userEntity = await User.FetchOneById(User, user.id) || new User(user.id, 300);

        userEntity.AddCurrency(amount.value! as number);

        await userEntity.Save(User, userEntity);

        await interaction.reply(`${amount.value} currency ${amount.value! as number >= 0 ? "given to" : "taken from"} ${user.username}, they now have ${userEntity.Currency}`);
    }
}