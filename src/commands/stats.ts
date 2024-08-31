import {CommandInteraction, EmbedBuilder, PermissionsBitField, SlashCommandBuilder} from "discord.js";
import {Command} from "../type/command";
import {CoreClient} from "../client/client";
import {CardRarity} from "../constants/CardRarity";
import EmbedColours from "../constants/EmbedColours";

export default class Stats extends Command {
    constructor() {
        super();

        this.CommandBuilder = new SlashCommandBuilder()
            .setName("stats")
            .setDescription("Get bot stats such as card info")
            .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator);
    }

    public override async execute(interaction: CommandInteraction) {
        const allCards = CoreClient.Cards.flatMap(x => x.cards);

        const totalCards = allCards.length;
        const bronzeCards = allCards.filter(x => x.type == CardRarity.Bronze)
            .length;
        const silverCards = allCards.filter(x => x.type == CardRarity.Silver)
            .length;
        const goldCards = allCards.filter(x => x.type == CardRarity.Gold)
            .length;
        const mangaCards = allCards.filter(x => x.type == CardRarity.Manga)
            .length;
        const legendaryCards = allCards.filter(x => x.type == CardRarity.Legendary)
            .length;

        const description = [
            `${totalCards} Total`,
            `${bronzeCards} Bronze`,
            `${silverCards} Silver`,
            `${goldCards} Gold`,
            `${mangaCards} Manga`,
            `${legendaryCards} Legendary`,
        ].join("\n");

        const embed = new EmbedBuilder()
            .setTitle("Stats")
            .setDescription(description)
            .setColor(EmbedColours.Ok);

        await interaction.reply({
            embeds: [ embed ],
            ephemeral: true,
        });
    }
}
