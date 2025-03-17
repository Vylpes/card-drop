import { CommandInteraction } from "discord.js";
import EffectHelper from "../../helpers/EffectHelper";

export default async function Buy(interaction: CommandInteraction) {
    const id = interaction.options.get("id", true).value!;
    const quantity = interaction.options.get("quantity")?.value ?? 1;

    const idValue = id.toString();
    const quantityValue = Number(quantity);

    const result = await EffectHelper.GenerateEffectBuyEmbed(interaction.user.id, idValue, quantityValue, false);

    if (typeof result == "string") {
        await interaction.reply(result);
        return;
    }

    await interaction.reply({
        embeds: [ result.embed ],
        components: [ result.row ],
    });
}