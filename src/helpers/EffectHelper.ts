import {ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder} from "discord.js";
import UserEffect from "../database/entities/app/UserEffect";
import EmbedColours from "../constants/EmbedColours";
import {EffectDetails} from "../constants/EffectDetails";

export default class EffectHelper {
    public static async AddEffectToUserInventory(userId: string, name: string, quantity: number = 1) {
        let effect = await UserEffect.FetchOneByUserIdAndName(userId, name);

        if (!effect) {
            effect = new UserEffect(name, userId, quantity);
        } else {
            effect.AddUnused(quantity);
        }

        await effect.Save(UserEffect, effect);
    }

    public static async UseEffect(userId: string, name: string, whenExpires: Date): Promise<boolean> {
        const canUseEffect = await this.CanUseEffect(userId, name);

        if (!canUseEffect) return false;

        const effect = await UserEffect.FetchOneByUserIdAndName(userId, name);

        if (!effect) return false;

        effect.UseEffect(whenExpires);

        await effect.Save(UserEffect, effect);

        return true;
    }

    public static async CanUseEffect(userId: string, name: string): Promise<boolean> {
        const effect = await UserEffect.FetchOneByUserIdAndName(userId, name);
        const now = new Date();

        if (!effect || effect.Unused == 0) {
            console.log(1);
            return false;
        }

        const effectDetail = EffectDetails.get(effect.Name);

        if (!effectDetail) {
            console.log(2);
            return false;
        }

        if (effect.WhenExpires && now < new Date(effect.WhenExpires.getMilliseconds() + effectDetail.cooldown)) {
            console.log(3);
            return false;
        }

        return true;
    }

    public static async HasEffect(userId: string, name: string): Promise<boolean> {
        const effect = await UserEffect.FetchOneByUserIdAndName(userId, name);
        const now = new Date();

        if (!effect || !effect.WhenExpires) {
            return false;
        }

        if (now > effect.WhenExpires) {
            return false;
        }

        return true;
    }

    public static async GenerateEffectEmbed(userId: string, page: number): Promise<{
        embed: EmbedBuilder,
        row: ActionRowBuilder<ButtonBuilder>,
    }> {
        const itemsPerPage = 10;

        const query = await UserEffect.FetchAllByUserIdPaginated(userId, page - 1, itemsPerPage);

        const effects = query[0];
        const count = query[1];

        const totalPages = count > 0 ? Math.ceil(count / itemsPerPage) : 1;

        let description = "*none*";

        if (effects.length > 0) {
            description = effects.map(x => `${x.Name} x${x.Unused}`).join("\n");
        }

        const embed = new EmbedBuilder()
            .setTitle("Effects")
            .setDescription(description)
            .setColor(EmbedColours.Ok)
            .setFooter({ text: `Page ${page} of ${totalPages}` });

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`effects list ${page - 1}`)
                    .setLabel("Previous")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page == 1),
                new ButtonBuilder()
                    .setCustomId(`effects list ${page + 1}`)
                    .setLabel("Next")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page == totalPages),
            );

        return {
            embed,
            row,
        };
    }
}
