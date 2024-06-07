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
        const user1UserId = interaction.customId.split(" ")[2];
        const user2UserId = interaction.customId.split(" ")[3];
        const user1CardNumber = interaction.customId.split(" ")[4];
        const user2CardNumber = interaction.customId.split(" ")[5];
        const expiry = interaction.customId.split(" ")[6];
        const timeoutId = interaction.customId.split(" ")[7];

        AppLogger.LogSilly("Button/Trade/AcceptTrade", `Parameters: user1UserId=${user1UserId}, user2UserId=${user2UserId}, user1CardNumber=${user1CardNumber}, user2CardNumber=${user2CardNumber}, expiry=${expiry}, timeoutId=${timeoutId}`);

        const expiryDate = new Date(expiry);

        if (expiryDate < new Date()) {
            await interaction.reply("Trade has expired");
            return;
        }

        if (interaction.user.id !== user2UserId) {
            await interaction.reply("You are not the user who the trade is intended for");
            return;
        }

        const user1Item = CoreClient.Cards
            .flatMap(x => x.cards)
            .find(x => x.id === user1CardNumber);

        const user2Item = CoreClient.Cards
            .flatMap(x => x.cards)
            .find(x => x.id === user2CardNumber);

        if (!user1Item || !user2Item) {
            await interaction.reply("One or more of the items you are trying to trade does not exist.");
            return;
        }

        const user1User = interaction.client.users.cache.get(user1UserId) || await interaction.client.users.fetch(user1UserId);
        const user2User = interaction.client.users.cache.get(user2UserId) || await interaction.client.users.fetch(user2UserId);

        const user1UserInventory1 = await Inventory.FetchOneByCardNumberAndUserId(user1UserId, user1CardNumber);
        const user2UserInventory1 = await Inventory.FetchOneByCardNumberAndUserId(user2UserId, user2CardNumber);

        if (!user1UserInventory1 || !user2UserInventory1) {
            await interaction.reply("One or more of the items you are trying to trade does not exist.");
            return;
        }

        if (user1UserInventory1.Quantity < 1 || user2UserInventory1.Quantity < 1) {
            await interaction.reply("One or more of the items you are trying to trade does not exist.");
            return;
        }

        user1UserInventory1.SetQuantity(user1UserInventory1.Quantity - 1);
        user2UserInventory1.SetQuantity(user2UserInventory1.Quantity - 1);

        await user1UserInventory1.Save(Inventory, user1UserInventory1);
        await user2UserInventory1.Save(Inventory, user2UserInventory1);

        let user1UserInventory2 = await Inventory.FetchOneByCardNumberAndUserId(user1UserId, user2CardNumber);
        let user2UserInventory2 = await Inventory.FetchOneByCardNumberAndUserId(user2UserId, user1CardNumber);

        if (!user1UserInventory2) {
            user1UserInventory2 = new Inventory(user1UserId, user1CardNumber, 1);
        } else {
            user1UserInventory2.SetQuantity(user1UserInventory2.Quantity + 1);
        }

        if (!user2UserInventory2) {
            user2UserInventory2 = new Inventory(user2UserId, user2CardNumber, 1);
        } else {
            user2UserInventory2.SetQuantity(user2UserInventory2.Quantity + 1);
        }

        await user1UserInventory2.Save(Inventory, user1UserInventory2);
        await user2UserInventory2.Save(Inventory, user2UserInventory2);

        clearTimeout(timeoutId);

        const tradeEmbed = new EmbedBuilder()
            .setTitle("Trade Accepted")
            .setDescription(`Trade initiated between ${user1User.username} and ${user2User.username}`)
            .setColor(EmbedColours.Success)
            .setImage("https://i.imgur.com/9w5f1ls.gif")
            .addFields([
                {
                    name: `${user1User.username} Receives`,
                    value: `${user2Item.id}: ${user2Item.name}`,
                    inline: true,
                },
                {
                    name: `${user2User.username} Receives`,
                    value: `${user1Item.id}: ${user1Item.name}`,
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
        const user1UserId = interaction.customId.split(" ")[2];
        const user2UserId = interaction.customId.split(" ")[3];
        const user1CardNumber = interaction.customId.split(" ")[4];
        const user2CardNumber = interaction.customId.split(" ")[5];
        // No need to get expiry date
        const timeoutId = interaction.customId.split(" ")[7];

        AppLogger.LogSilly("Button/Trade/DeclineTrade", `Parameters: user1UserId=${user1UserId}, user2UserId=${user2UserId}, user1CardNumber=${user1CardNumber}, user2CardNumber=${user2CardNumber}, timeoutId=${timeoutId}`);

        if (interaction.user.id != user1UserId && interaction.user.id !== user2UserId) {
            await interaction.reply("You are not the user who the trade is intended for");
            return;
        }

        const user1User = interaction.client.users.cache.get(user1UserId) || await interaction.client.users.fetch(user1UserId);
        const user2User = interaction.client.users.cache.get(user2UserId) || await interaction.client.users.fetch(user2UserId);

        const user1Item = CoreClient.Cards
            .flatMap(x => x.cards)
            .find(x => x.id === user1CardNumber);

        const user2Item = CoreClient.Cards
            .flatMap(x => x.cards)
            .find(x => x.id === user2CardNumber);

        if (!user1Item || !user2Item) {
            await interaction.reply("One or more of the items you are trying to trade does not exist.");
            return;
        }

        clearTimeout(timeoutId);

        const tradeEmbed = new EmbedBuilder()
            .setTitle("Trade Declined")
            .setDescription(`Trade initiated between ${user1User.username} and ${user2User.username}`)
            .setColor(EmbedColours.Error)
            .setImage("https://i.imgur.com/9w5f1ls.gif")
            .addFields([
                {
                    name: `${user1User.username} Receives`,
                    value: `${user2Item.id}: ${user2Item.name}`,
                    inline: true,
                },
                {
                    name: `${user2User.username} Receives`,
                    value: `${user1Item.id}: ${user1Item.name}`,
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