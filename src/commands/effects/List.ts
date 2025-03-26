import { CommandInteraction } from "discord.js";
import EffectHelper from "../../helpers/EffectHelper";

export default async function List(interaction: CommandInteraction) {
    const pageOption = interaction.options.get("page");

    const page = !isNaN(Number(pageOption?.value)) ? Number(pageOption?.value) : 1;

    const result = await EffectHelper.GenerateEffectListEmbed(interaction.user.id, page);

    await interaction.reply({
        embeds: [ result.embed ],
        components: [ result.row ],
    });
}