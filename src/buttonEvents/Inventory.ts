import { ButtonInteraction } from "discord.js";
import { ButtonEvent } from "../type/buttonEvent";
import InventoryHelper from "../helpers/InventoryHelper";

export default class Inventory extends ButtonEvent {
    public override async execute(interaction: ButtonInteraction) {
        const userid = interaction.customId.split(' ')[1];
        const page = interaction.customId.split(' ')[2];

        try {
            const embed = await InventoryHelper.GenerateInventoryPage(interaction.user.username, userid, Number(page));

            await interaction.update({
                embeds: [ embed.embed ],
                components: [ embed.row ],
            });
        } catch {
            await interaction.reply("No page for user found.");
        }
    }
}