import {ButtonInteraction} from "discord.js";
import {ButtonEvent} from "../type/buttonEvent";
import EffectHelper from "../helpers/EffectHelper";

export default class Effects extends ButtonEvent {
    public override async execute(interaction: ButtonInteraction) {
        const action = interaction.customId.split(" ")[1];

        switch (action) {
            case "list":
                await this.List(interaction);
                break;
        }
    }

    private async List(interaction: ButtonInteraction) {
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
}
