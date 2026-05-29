import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../type/command";
import InventoryHelper from "../helpers/InventoryHelper";
import AppLogger from "../client/appLogger";

export default class Inventory extends Command {
    constructor() {
        super();

        this.CommandBuilder = new SlashCommandBuilder()
            .setName("inventory")
            .setDescription("View your inventory")
            .addNumberOption(x =>
                x
                    .setName("page")
                    .setDescription("The page to start with"))
            .addStringOption(x =>
                x
                    .setName("sortby")
                    .setDescription("How to sort cards in each series")
                    .addChoices(
                        { name: "ID", value: "id" },
                        { name: "Name", value: "name" },
                        { name: "Type", value: "type" }))
            .addUserOption(x =>
                x
                    .setName("user")
                    .setDescription("The user to view (Defaults to yourself)"));
    }

    public override async execute(interaction: ChatInputCommandInteraction) {
        const page = interaction.options.get("page");
        const userOption = interaction.options.get("user");
        const sortByOption = interaction.options.get("sortby");

        const user = userOption ? userOption.user! : interaction.user;
        const sortBy = InventoryHelper.ParseSortBy(sortByOption?.value?.toString());

        await interaction.deferReply();

        AppLogger.LogSilly("Commands/Inventory", `Parameters: page=${page?.value}, user=${user.id}, sortBy=${sortBy}`);

        try {
            let pageNumber = 0;

            if (page?.value) {
                pageNumber = Number(page.value) - 1;
            }

            const embed = await InventoryHelper.GenerateInventoryPage(user.username, user.id, pageNumber, sortBy);

            if (!embed) {
                await interaction.followUp("No page for user found.");
                return;
            }

            await interaction.followUp({
                files: [ embed.image ],
                embeds: [ embed.embed ],
                components: [ embed.row1, embed.row2 ],
            });
        } catch (e) {
            AppLogger.LogError("Commands/Inventory", e as string);

            await interaction.followUp("An error has occurred running this command.");
        }
    }
}
