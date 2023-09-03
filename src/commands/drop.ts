import { ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { Command } from "../type/command";
import CardDropHelper from "../helpers/CardDropHelper";
import { CardRarityToColour, CardRarityToString } from "../constants/CardRarity";
import { readFileSync } from "fs";
import { CoreClient } from "../client/client";
import { v4 } from "uuid";

export default class Drop extends Command {
    constructor() {
        super();

        super.CommandBuilder = new SlashCommandBuilder()
            .setName('drop')
            .setDescription('Summon a new card drop');
    }

    public override async execute(interaction: CommandInteraction) {
        const randomCard = await CardDropHelper.GetRandomCard();

        const image = readFileSync(randomCard.Path);

        const attachment = new AttachmentBuilder(image, { name: `${randomCard.Id}.png` });

        const embed = new EmbedBuilder()
            .setTitle(randomCard.Name)
            .setDescription(randomCard.Series.Name)
            .setFooter({ text: CardRarityToString(randomCard.Rarity) })
            .setColor(CardRarityToColour(randomCard.Rarity))
            .setImage(`attachment://${randomCard.Id}.png`);

        const row = new ActionRowBuilder<ButtonBuilder>();

        const claimId = v4();

        row.addComponents(
            new ButtonBuilder()
                .setCustomId(`claim ${randomCard.CardNumber} ${claimId}`)
                .setLabel("Claim")
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId(`reroll`)
                .setLabel("Reroll")
                .setStyle(ButtonStyle.Secondary));

        await interaction.reply({
            embeds: [ embed ],
            files: [ attachment ],
            components: [ row ],
        });

        CoreClient.ClaimId = claimId;
    }
}