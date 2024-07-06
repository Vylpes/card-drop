import { ButtonInteraction } from "discord.js";
import { ButtonEvent } from "../type/buttonEvent";
import InventoryHelper from "../helpers/InventoryHelper";
import AppLogger from "../client/appLogger";

export default class Inventory extends ButtonEvent {
    public override async execute(interaction: ButtonInteraction) {
        if (!interaction.guild) return;

        const userid = interaction.customId.split(" ")[1];
        const page = interaction.customId.split(" ")[2];

        AppLogger.LogSilly("Button/Inventory", `Parameters: userid=${userid}, page=${page}`);
        
        await interaction.deferUpdate();

        const member = interaction.guild.members.cache.find(x => x.id == userid) || await interaction.guild.members.fetch(userid);

        if (!member) {
            await interaction.reply("Unable to find user.");
            return;
        }

        try {
            AppLogger.LogVerbose("Button/Inventory", `Generating inventory page ${page} for ${member.user.username} with id ${member.user.id}`);

            const embed = await InventoryHelper.GenerateInventoryPage(member.user.username, member.user.id, Number(page));

            if (!embed) {
                await interaction.followUp("No page for user found.");
                return;
            }

            await interaction.followUp({
                files: [ embed.image ],
                embeds: [ embed.embed ],
                components: [ embed.row ],
            });
        } catch (e) {
            AppLogger.LogError("Button/Inventory", `Error generating inventory page for ${member.user.username} with id ${member.user.id}: ${e}`);

            await interaction.followUp("An error has occurred running this command.");
        }
    }
}
