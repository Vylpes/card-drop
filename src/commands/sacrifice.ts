import { ActionRowBuilder, ButtonBuilder, ButtonStyle, CacheType, CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { Command } from "../type/command";
import Inventory from "../database/entities/app/Inventory";
import { CardRarityToString, GetSacrificeAmount } from "../constants/CardRarity";
import CardDropHelperMetadata from "../helpers/CardDropHelperMetadata";
import EmbedColours from "../constants/EmbedColours";

export default class Sacrifice extends Command {
    constructor() {
        super();

        this.CommandBuilder = new SlashCommandBuilder()
            .setName("sacrifice")
            .setDescription("Sacrifices a card for currency")
            .addStringOption(x =>
                x
                    .setName("cardnumber")
                    .setDescription("The card to sacrifice from your inventory")
                    .setRequired(true))
            .addNumberOption(x =>
                x
                    .setName("quantity")
                    .setDescription("The amount to sacrifice (default 1)"));
    }

    public override async execute(interaction: CommandInteraction<CacheType>): Promise<void> {
        const cardnumber = interaction.options.get("cardnumber", true);
        const quantityInput = interaction.options.get("quantity")?.value ?? 1;

        const quantity = Number(quantityInput) || 1;

        const cardInInventory = await Inventory.FetchOneByCardNumberAndUserId(interaction.user.id, cardnumber.value! as string);

        if (!cardInInventory || cardInInventory.Quantity == 0) {
            await interaction.reply("Unable to find card in your inventory.");
            return;
        }

        if (cardInInventory.Quantity < quantity) {
            await interaction.reply(`You can only sacrifice what you own! You have ${cardInInventory.Quantity} of this card`);
            return;
        }

        const cardData = CardDropHelperMetadata.GetCardByCardNumber(cardnumber.value! as string);

        if (!cardData) {
            await interaction.reply("Unable to find card in the database.");
            return;
        }

        const cardValue = GetSacrificeAmount(cardData.card.type) * quantity;
        const cardRarityString = CardRarityToString(cardData.card.type);

        const description = [
            `Card: ${cardData.card.name}`,
            `Series: ${cardData.series.name}`,
            `Rarity: ${cardRarityString}`,
            `Quantity Owned: ${cardInInventory.Quantity}`,
            `Quantity To Sacrifice: ${quantity}`,
            `Sacrifice Amount: ${cardValue}`,
        ];

        const embed = new EmbedBuilder()
            .setTitle("Sacrifice")
            .setDescription(description.join("\n"))
            .setColor(EmbedColours.Error)
            .setFooter({ text: `${interaction.user.username}` });

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents([
                new ButtonBuilder()
                    .setCustomId(`sacrifice confirm ${interaction.user.id} ${cardnumber.value!} ${quantity}`)
                    .setLabel("Confirm")
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`sacrifice cancel ${interaction.user.id} ${cardnumber.value!} ${quantity}`)
                    .setLabel("Cancel")
                    .setStyle(ButtonStyle.Secondary),
            ]);

        await interaction.reply({
            embeds: [ embed ],
            components: [ row ],
        });
    }
}