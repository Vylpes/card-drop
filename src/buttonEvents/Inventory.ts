import { ButtonInteraction } from "discord.js";
import { ButtonEvent } from "../type/buttonEvent";
import InventoryHelper from "../helpers/InventoryHelper";

export default class Inventory extends ButtonEvent {
    public override async execute(interaction: ButtonInteraction) {
        if (!interaction.guild) return;

        const userid = interaction.customId.split(" ")[1];
        const page = interaction.customId.split(" ")[2];

        const member = interaction.guild.members.cache.find(x => x.id == userid) || await interaction.guild.members.fetch(userid);

        if (!member) {
            await interaction.reply("Unable to find user.");
            return;
        }

        try {
            const embed = await InventoryHelper.GenerateInventoryPage(member.user.username, member.user.id, Number(page));

            await interaction.update({
                embeds: [ embed.embed ],
                components: [ embed.row ],
            });
        } catch (e) {
            console.error(e);
            await interaction.reply("No page for user found.");
        }
    }
}