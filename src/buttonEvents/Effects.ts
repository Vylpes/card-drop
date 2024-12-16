import {ButtonInteraction,EmbedBuilder} from "discord.js";
import {ButtonEvent} from "../type/buttonEvent";
import EffectHelper from "../helpers/EffectHelper";
import { EffectDetails } from "../constants/EffectDetails";

export default class Effects extends ButtonEvent {
    public override async execute(interaction: ButtonInteraction) {
        const action = interaction.customId.split(" ")[1];

        switch (action) {
            case "list":
                await this.List(interaction);
                break;
            case "use":
                await this.Use(interaction);
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

    private async Use(interaction: ButtonInteraction) {
        const subaction = interaction.customId.split(" ")[2];

        switch (subaction) {
            case "confirm":
                await this.UseConfirm(interaction);
                break;
        }
    }

    private async UseConfirm(interaction: ButtonInteraction) {
        const id = interaction.customId.split(" ")[3];

        const effectDetail = EffectDetails.get(id);

        if (!effectDetail) {
            await interaction.reply("Unable to find effect!");
            return;
        }

        const now = new Date();
        const whenExpires = new Date(now.getMilliseconds() + effectDetail.duration);

        const result = await EffectHelper.UseEffect(interaction.user.id, id, whenExpires);

        if (result) {
            const embed = new EmbedBuilder()
                .setTitle("Effect Used")
                .setDescription("You now have an active effect!")
                .addFields([
                    {
                        name: "Effect",
                        value: effectDetail.friendlyName,
                        inline: true,
                    },
                    {
                        name: "Expires",
                        value: `<t:${whenExpires.getMilliseconds()}:f>`,
                        inline: true,
                    },
                ]);

            await interaction.update({ embeds: [ embed ] });
            return;
        }

        await interaction.reply("Unable to use effect! Please make sure you have it in your inventory and is not on cooldown");
    }
}
