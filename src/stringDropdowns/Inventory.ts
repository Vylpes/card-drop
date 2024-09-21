import {StringSelectMenuInteraction} from "discord.js";
import {StringDropdownEvent} from "../type/stringDropdownEvent";
import AppLogger from "../client/appLogger";
import InventoryHelper from "../helpers/InventoryHelper";

export default class Inventory extends StringDropdownEvent {
    public override async execute(interaction: StringSelectMenuInteraction) {
        if (!interaction.guild) return;

        const userid = interaction.values[0].split(" ")[0];
        const page = interaction.values[0].split(" ")[1];

        AppLogger.LogDebug("StringDropdown/Inventory", `Parameters: userid=${userid}, page=${page}`);

        await interaction.deferUpdate();

        const member = interaction.guild.members.cache.find(x => x.id == userid) || await interaction.guild.members.fetch(userid);

        if (!member) {
            await interaction.reply("Unable to find user.");
            return;
        }

        try {
            const embed = await InventoryHelper.GenerateInventoryPage(member.user.username, member.user.id, Number(page));

            if (!embed) {
                await interaction.followUp("No page for user found.");
                return;
            }

            await interaction.editReply({
                files: [ embed.image ],
                embeds: [ embed.embed ],
                components: [ embed.row1, embed.row2 ],
            });
        } catch (e) {
            AppLogger.LogError("StringDropdown/Inventory", `Error generating inventory page for ${member.user.username} with id ${member.user.id}: ${e}`);

            await interaction.followUp("An error has occurred running this command.");
        }
    }
}
