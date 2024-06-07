import { ActionRowBuilder, ButtonBuilder, ButtonStyle, CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { Command } from "../type/command";
import Inventory from "../database/entities/app/Inventory";
import { CoreClient } from "../client/client";
import EmbedColours from "../constants/EmbedColours";
import AppLogger from "../client/appLogger";

export default class Trade extends Command {
    constructor() {
        super();

        this.CommandBuilder = new SlashCommandBuilder()
            .setName("trade")
            .setDescription("Initiate a trade with another user.")
            .addUserOption(x =>
                x
                    .setName("user")
                    .setDescription("User to trade with")
                    .setRequired(true))
            .addStringOption(x =>
                x
                    .setName("give")
                    .setDescription("Item to give")
                    .setRequired(true))
            .addStringOption(x =>
                x
                    .setName("receive")
                    .setDescription("Item to receive")
                    .setRequired(true));
    }

    public override async execute(interaction: CommandInteraction) {
        const user = interaction.options.get("user", true).user!;
        const give = interaction.options.get("give", true);
        const receive = interaction.options.get("receive", true);

        AppLogger.LogSilly("Commands/Trade", `Parameters: user=${user.id}, give=${give.value}, receive=${receive.value}`);

        if (interaction.user.id == user.id) {
            await interaction.reply("You can not create a trade with yourself.");
            return;
        }

        const user1ItemEntity = await Inventory.FetchOneByCardNumberAndUserId(interaction.user.id, give.value!.toString());
        const user2ItemEntity = await Inventory.FetchOneByCardNumberAndUserId(user.id, receive.value!.toString());

        if (!user1ItemEntity) {
            await interaction.reply("You do not have the item you are trying to trade.");
            return;
        }

        if (!user2ItemEntity) {
            await interaction.reply("The user you are trying to trade with does not have the item you are trying to trade for.");
            return;
        }

        const user1Item = CoreClient.Cards
            .flatMap(x => x.cards)
            .find(x => x.id === give.value!.toString());

        const user2Item = CoreClient.Cards
            .flatMap(x => x.cards)
            .find(x => x.id === receive.value!.toString());

        if (!user1Item || !user2Item) {
            await interaction.reply("One or more of the items you are trying to trade does not exist.");
            return;
        }

        const now = new Date();
        const expiry = now.setMinutes(now.getMinutes() + 15);

        const tradeEmbed = new EmbedBuilder()
            .setTitle("⚠️ Trade Offer ⚠️")
            .setDescription(`Trade initiated between ${interaction.user.username} and ${user.username}`)
            .setColor(EmbedColours.Grey)
            .setImage("https://media1.tenor.com/m/KkZwKl2AQ2QAAAAd/trade-offer.gif")
            .addFields([
                {
                    name: `${interaction.user.username} Receives`,
                    value: `${user2Item.id}: ${user2Item.name}`,
                    inline: true,
                },
                {
                    name: `${user.username} Receives`,
                    value: `${user1Item.id}: ${user1Item.name}`,
                    inline: true,
                },
                {
                    name: "Expires",
                    value: new Date(expiry).toLocaleString(),
                }
            ]);

        const timeoutId = setTimeout(async () => this.autoDecline(interaction, interaction.user.username, user.username, user1Item.id, user2Item.id, user1Item.name, user2Item.name), 1000 * 60 * 15); // 15 minutes

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents([
                new ButtonBuilder()
                    .setCustomId(`trade accept ${interaction.user.id} ${user.id} ${user1Item.id} ${user2Item.id} ${expiry} ${timeoutId}`)
                    .setLabel("Accept")
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`trade decline ${interaction.user.id} ${user.id} ${user1Item.id} ${user2Item.id} ${expiry} ${timeoutId}`)
                    .setLabel("Decline")
                    .setStyle(ButtonStyle.Danger),
            ]);

        await interaction.reply({ content: `${user}`, embeds: [ tradeEmbed ], components: [ row ] });
    }

    private async autoDecline(interaction: CommandInteraction, user1Username: string, user2Username: string, user1CardNumber: string, user2CardNumber: string, user1CardName: string, user2CardName: string) {
        AppLogger.LogSilly("Commands/Trade/AutoDecline", `Auto declining trade between ${user1Username} and ${user2Username}`);

        const tradeEmbed = new EmbedBuilder()
            .setTitle("Trade Expired")
            .setDescription(`Trade initiated between ${user1Username} and ${user2Username}`)
            .setColor(EmbedColours.Error)
            .setImage("https://media1.tenor.com/m/KkZwKl2AQ2QAAAAd/trade-offer.gif")
            .addFields([
                {
                    name: `${user1Username} Receives`,
                    value: `${user2CardNumber}: ${user2CardName}`,
                    inline: true,
                },
                {
                    name: `${user2Username} Receives`,
                    value: `${user1CardNumber}: ${user1CardName}`,
                    inline: true,
                },
                {
                    name: "Expired",
                    value: new Date().toLocaleString(),
                }
            ]);

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents([
                new ButtonBuilder()
                    .setCustomId("trade expired accept")
                    .setLabel("Accept")
                    .setStyle(ButtonStyle.Success)
                    .setDisabled(true),
                new ButtonBuilder()
                    .setCustomId("trade expired declined")
                    .setLabel("Decline")
                    .setStyle(ButtonStyle.Danger)
                    .setDisabled(true),
            ]);

        await interaction.editReply({ embeds: [ tradeEmbed ], components: [ row ]});
    }
}