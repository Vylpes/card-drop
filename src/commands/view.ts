import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../type/command";
import AppLogger from "../client/appLogger";
import CardSearchHelper from "../helpers/CardSearchHelper";

export default class View extends Command {
    constructor() {
        super();

        this.CommandBuilder = new SlashCommandBuilder()
            .setName("view")
            .setDescription("Search for a card by its name")
            .addStringOption(x =>
                x
                    .setName("name")
                    .setDescription("The card name to search for")
                    .setRequired(true));
    }

    public override async execute(interaction: CommandInteraction) {
        const name = interaction.options.get("name", true);

        AppLogger.LogSilly("Commands/View", `Parameters: name=${name.value}`);

        await interaction.deferReply();

        const searchResult = await CardSearchHelper.GenerateSearchQuery(name.value!.toString(), interaction.user.id, 7);

        if (!searchResult) {
            await interaction.editReply("No results found");
            return;
        }

        await interaction.editReply({
            embeds: [ searchResult.embed ],
            components: [ searchResult.row ],
            files: [ searchResult.attachment ],
        });
    }
}