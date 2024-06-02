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
        const user = interaction.options.getUser("user")!;
        const give = interaction.options.get("give")!;
        const receive = interaction.options.get("receive")!;

        AppLogger.LogSilly("Commands/Trade", `Parameters: user=${user.id}, give=${give.value}, receive=${receive.value}`);

        if (interaction.user.id == user.id) {
            await interaction.reply("You can not create a trade with yourself.");
            return;
        }

        const giveItemEntity = await Inventory.FetchOneByCardNumberAndUserId(interaction.user.id, give.value!.toString());
        const receiveItemEntity = await Inventory.FetchOneByCardNumberAndUserId(user.id, receive.value!.toString());

        if (!giveItemEntity) {
            await interaction.reply("You do not have the item you are trying to trade.");
            return;
        }

        if (!receiveItemEntity) {
            await interaction.reply("The user you are trying to trade with does not have the item you are trying to trade for.");
            return;
        }

        const giveItem = CoreClient.Cards
            .flatMap(x => x.cards)
            .find(x => x.id === give.value!.toString());

        const receiveItem = CoreClient.Cards
            .flatMap(x => x.cards)
            .find(x => x.id === receive.value!.toString());

        if (!giveItem || !receiveItem) {
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
                    name: "I Receive",
                    value: `${receiveItem.id}: ${receiveItem.name}`,
                    inline: true,
                },
                {
                    name: "You Receive",
                    value: `${giveItem.id}: ${giveItem.name}`,
                    inline: true,
                },
                {
                    name: "Expires",
                    value: new Date(expiry).toLocaleString(),
                }
            ]);

        const timeoutId = setTimeout(async () => this.autoDecline(interaction, interaction.user.username, user.username, giveItem.id, receiveItem.id, giveItem.name, receiveItem.name), 1000 * 60 * 15); // 15 minutes

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents([
                new ButtonBuilder()
                    .setCustomId(`trade accept ${interaction.user.id} ${user.id} ${giveItem.id} ${receiveItem.id} ${expiry} ${timeoutId}`)
                    .setLabel("Accept")
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`trade decline ${interaction.user.id} ${user.id} ${giveItem.id} ${receiveItem.id} ${expiry} ${timeoutId}`)
                    .setLabel("Decline")
                    .setStyle(ButtonStyle.Danger),
            ]);

        await interaction.reply({ content: `${user}`, embeds: [ tradeEmbed ], components: [ row ] });
    }

    private async autoDecline(interaction: CommandInteraction, giveUsername: string, receiveUsername: string, giveCardNumber: string, receiveCardNumber: string, giveCardName: string, receiveCardName: string) {
        AppLogger.LogSilly("Commands/Trade/AutoDecline", `Auto declining trade between ${giveUsername} and ${receiveUsername}`);

        const tradeEmbed = new EmbedBuilder()
            .setTitle("Trade Expired")
            .setDescription(`Trade initiated between ${receiveUsername} and ${giveUsername}`)
            .setColor(EmbedColours.Error)
            .setImage("https://media1.tenor.com/m/KkZwKl2AQ2QAAAAd/trade-offer.gif")
            .addFields([
                {
                    name: "I Receive",
                    value: `${receiveCardNumber}: ${receiveCardName}`,
                    inline: true,
                },
                {
                    name: "You Receive",
                    value: `${giveCardNumber}: ${giveCardName}`,
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