import { ButtonInteraction } from "discord.js";
import EffectHelper from "../../helpers/EffectHelper";

export default async function List(interaction: ButtonInteraction) {
    const pageOption = interaction.customId.split(" ")[2];

    const page = Number(pageOption);

    if (!page) {
        await interaction.reply("Page option is not a valid number");
        return;
    }

    const result = await EffectHelper.GenerateEffectEmbed(interaction.user.id, page);

    await interaction.update({
        embeds: [ result.embed ],
        components: [ result.row ],
    });
}