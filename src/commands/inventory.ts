import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../type/command";
import InventoryHelper from "../helpers/InventoryHelper";

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
            .addUserOption(x =>
                x
                    .setName("user")
                    .setDescription("The user to view (Defaults to yourself)"));
    }

    public override async execute(interaction: CommandInteraction) {
        const page = interaction.options.get("page");
        const user = interaction.options.getUser("user") || interaction.user;

        try {
            let pageNumber = 0;

            if (page && page.value) {
                pageNumber = Number(page.value) - 1;
            }

            const embed = await InventoryHelper.GenerateInventoryPage(user.username, user.id, pageNumber);

            await interaction.reply({
                content: `${user.username} - ${user.id}`,
                embeds: [ embed.embed ],
                components: [ embed.row ],
            });
        } catch {
            await interaction.reply("No page for user found.");
        }
    }
}