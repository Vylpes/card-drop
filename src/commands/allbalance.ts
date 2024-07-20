import { CommandInteraction, EmbedBuilder, PermissionsBitField, SlashCommandBuilder } from "discord.js";
import EmbedColours from "../constants/EmbedColours";
import { Command } from "../type/command";
import User from "../database/entities/app/User";

export default class AllBalance extends Command {
    constructor() {
        super();

        this.CommandBuilder = new SlashCommandBuilder()
            .setName("allbalance")
            .setDescription("Get everyone's currency balance")
            .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator);
    }

    public override async execute(interaction: CommandInteraction) {
        const users = await User.FetchAll(User);

        const filteredUsers = users.filter(x => x.Currency > 0);

        const embed = new EmbedBuilder()
            .setColor(EmbedColours.Ok)
            .setTitle("All Balances")
            .setDescription(filteredUsers.map(x => `<@${x.Id}> ${x.Currency}`).join("\n"));

        await interaction.reply({ embeds: [ embed ], ephemeral: true });
    }
}