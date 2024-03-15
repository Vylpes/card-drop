import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, EmbedBuilder } from "discord.js";
import { ButtonEvent } from "../type/buttonEvent";
import { CoreClient } from "../client/client";
import Inventory from "../database/entities/app/Inventory";
import EmbedColours from "../constants/EmbedColours";
import AppLogger from "../client/appLogger";

export default class Trade extends ButtonEvent {
    public override async execute(interaction: ButtonInteraction) {
        const action = interaction.customId.split(" ")[1];

        AppLogger.LogSilly("Button/Trade", `Parameters: action=${action}`);

        switch (action) {
        case "accept":
            await this.AcceptTrade(interaction);
            break;
        case "decline":
            await this.DeclineTrade(interaction);
            break;
        }
    }

    private async AcceptTrade(interaction: ButtonInteraction) {
        const giveUserId = interaction.customId.split(" ")[2];
        const receiveUserId = interaction.customId.split(" ")[3];
        const giveCardNumber = interaction.customId.split(" ")[4];
        const receiveCardNumber = interaction.customId.split(" ")[5];
        const expiry = interaction.customId.split(" ")[6];
        const timeoutId = interaction.customId.split(" ")[7];

        AppLogger.LogSilly("Button/Trade/AcceptTrade", `Parameters: giveUserId=${giveUserId}, receiveUserId=${receiveUserId}, giveCardNumber=${giveCardNumber}, receiveCardNumber=${receiveCardNumber}, expiry=${expiry}, timeoutId=${timeoutId}`);

        const expiryDate = new Date(expiry);

        if (expiryDate < new Date()) {
            await interaction.reply("Trade has expired");
            return;
        }

        if (interaction.user.id !== receiveUserId) {
            await interaction.reply("You are not the user who the trade is intended for");
            return;
        }

        const giveItem = CoreClient.Cards
            .flatMap(x => x.cards)
            .find(x => x.id === giveCardNumber);

        const receiveItem = CoreClient.Cards
            .flatMap(x => x.cards)
            .find(x => x.id === receiveCardNumber);

        if (!giveItem || !receiveItem) {
            await interaction.reply("One or more of the items you are trying to trade does not exist.");
            return;
        }

        const giveUser = interaction.client.users.cache.get(giveUserId) || await interaction.client.users.fetch(giveUserId);
        const receiveUser = interaction.client.users.cache.get(receiveUserId) || await interaction.client.users.fetch(receiveUserId);

        const giveUserInventory1 = await Inventory.FetchOneByCardNumberAndUserId(giveUserId, giveCardNumber);
        const receiveUserInventory1 = await Inventory.FetchOneByCardNumberAndUserId(receiveUserId, receiveCardNumber);

        if (!giveUserInventory1 || !receiveUserInventory1) {
            await interaction.reply("One or more of the items you are trying to trade does not exist.");
            return;
        }

        if (giveUserInventory1.Quantity < 1 || receiveUserInventory1.Quantity < 1) {
            await interaction.reply("One or more of the items you are trying to trade does not exist.");
            return;
        }

        giveUserInventory1.SetQuantity(giveUserInventory1.Quantity - 1);
        receiveUserInventory1.SetQuantity(receiveUserInventory1.Quantity - 1);

        await giveUserInventory1.Save(Inventory, giveUserInventory1);
        await receiveUserInventory1.Save(Inventory, receiveUserInventory1);

        let giveUserInventory2 = await Inventory.FetchOneByCardNumberAndUserId(receiveUserId, giveCardNumber);
        let receiveUserInventory2 = await Inventory.FetchOneByCardNumberAndUserId(giveUserId, receiveCardNumber);

        if (!giveUserInventory2) {
            giveUserInventory2 = new Inventory(receiveUserId, giveCardNumber, 1);
        } else {
            giveUserInventory2.SetQuantity(giveUserInventory2.Quantity + 1);
        }

        if (!receiveUserInventory2) {
            receiveUserInventory2 = new Inventory(giveUserId, receiveCardNumber, 1);
        } else {
            receiveUserInventory2.SetQuantity(receiveUserInventory2.Quantity + 1);
        }

        await giveUserInventory2.Save(Inventory, giveUserInventory2);
        await receiveUserInventory2.Save(Inventory, receiveUserInventory2);

        clearTimeout(timeoutId);

        const tradeEmbed = new EmbedBuilder()
            .setTitle("Trade Accepted")
            .setDescription(`Trade initiated between ${receiveUser.username} and ${giveUser.username}`)
            .setColor(EmbedColours.Success)
            .setImage("https://i.imgur.com/9w5f1ls.gif")
            .addFields([
                {
                    name: "I receieve",
                    value: `${receiveItem.id}: ${receiveItem.name}`,
                    inline: true,
                },
                {
                    name: "You receieve",
                    value: `${giveItem.id}: ${giveItem.name}`,
                    inline: true,
                },
                {
                    name: "Complete",
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
                    .setCustomId("trade expired decline")
                    .setLabel("Decline")
                    .setStyle(ButtonStyle.Danger)
                    .setDisabled(true),
            ]);

        await interaction.update({ embeds: [ tradeEmbed ], components: [ row ]});
    }

    private async DeclineTrade(interaction: ButtonInteraction) {
        const giveUserId = interaction.customId.split(" ")[2];
        const receiveUserId = interaction.customId.split(" ")[3];
        const giveCardNumber = interaction.customId.split(" ")[4];
        const receiveCardNumber = interaction.customId.split(" ")[5];
        // No need to get expiry date
        const timeoutId = interaction.customId.split(" ")[7];

        AppLogger.LogSilly("Button/Trade/DeclineTrade", `Parameters: giveUserId=${giveUserId}, receiveUserId=${receiveUserId}, giveCardNumber=${giveCardNumber}, receiveCardNumber=${receiveCardNumber}, timeoutId=${timeoutId}`);

        if (interaction.user.id != receiveUserId && interaction.user.id !==giveUserId) {
            await interaction.reply("You are not the user who the trade is intended for");
            return;
        }

        const giveUser = interaction.client.users.cache.get(giveUserId) || await interaction.client.users.fetch(giveUserId);
        const receiveUser = interaction.client.users.cache.get(receiveUserId) || await interaction.client.users.fetch(receiveUserId);

        const giveItem = CoreClient.Cards
            .flatMap(x => x.cards)
            .find(x => x.id === giveCardNumber);

        const receiveItem = CoreClient.Cards
            .flatMap(x => x.cards)
            .find(x => x.id === receiveCardNumber);

        if (!giveItem || !receiveItem) {
            await interaction.reply("One or more of the items you are trying to trade does not exist.");
            return;
        }

        clearTimeout(timeoutId);

        const tradeEmbed = new EmbedBuilder()
            .setTitle("Trade Declined")
            .setDescription(`Trade initiated between ${receiveUser.username} and ${giveUser.username}`)
            .setColor(EmbedColours.Error)
            .setImage("https://i.imgur.com/9w5f1ls.gif")
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
                    name: "Declined",
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
                    .setCustomId("trade expired decline")
                    .setLabel("Decline")
                    .setStyle(ButtonStyle.Danger)
                    .setDisabled(true),
            ]);

        await interaction.update({ embeds: [ tradeEmbed ], components: [ row ]});
    }
}