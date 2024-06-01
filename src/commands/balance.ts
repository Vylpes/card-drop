import { CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { Command } from "../type/command";
import User from "../database/entities/app/User";
import EmbedColours from "../constants/EmbedColours";

export default class Balance extends Command {
    constructor() {
        super();

        this.CommandBuilder = new SlashCommandBuilder()
        .setName("balance")
        .setDescription("Get your currency balance");
    }

    public override async execute(interaction: CommandInteraction) {
        const user = await User.FetchOneById(User, interaction.user.id);

        let userBalance = user != null ? user.Currency : 0;

        const embed = new EmbedBuilder()
            .setColor(EmbedColours.Ok)
            .setTitle("Balance")
            .setDescription(`You currently have **${userBalance} currency**!`)
            .setFooter({ text: interaction.user.username, iconURL: interaction.user.avatarURL() ?? undefined });

        await interaction.reply({ embeds: [ embed ]});
    }
}