import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import UserEffect from "../database/entities/app/UserEffect";
import EmbedColours from "../constants/EmbedColours";
import { EffectDetails } from "../constants/EffectDetails";
import User from "../database/entities/app/User";
import CardConstants from "../constants/CardConstants";
import AppLogger from "../client/appLogger";

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

        effect!.UseEffect(whenExpires);

        await effect!.Save(UserEffect, effect!);

        return true;
    }

    public static async CanUseEffect(userId: string, name: string): Promise<boolean> {
        const effect = await UserEffect.FetchOneByUserIdAndName(userId, name);
        const now = new Date();

        if (!effect || effect.Unused == 0) {
            return false;
        }

        const effectDetail = EffectDetails.get(effect.Name);

        if (!effectDetail) {
            return false;
        }

        if (effect.WhenExpires && now < new Date(effect.WhenExpires.getTime() + effectDetail.cooldown)) {
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

    public static async GenerateEffectListEmbed(userId: string, page: number): Promise<{
        embed: EmbedBuilder,
        row: ActionRowBuilder<ButtonBuilder>,
    }> {
        const itemsPerPage = 10;

        const query = await UserEffect.FetchAllByUserIdPaginated(userId, page - 1, itemsPerPage);
        const activeEffect = await UserEffect.FetchActiveEffectByUserId(userId);

        const effects = query[0];
        const count = query[1];

        const totalPages = count > 0 ? Math.ceil(count / itemsPerPage) : 1;

        let description = "*none*";

        if (effects.length > 0) {
            description = effects.map(x => `${EffectDetails.get(x.Name)?.friendlyName} x${x.Unused}`).join("\n");
        }

        const embed = new EmbedBuilder()
            .setTitle("Effects")
            .setDescription(description)
            .setColor(EmbedColours.Ok)
            .setFooter({ text: `Page ${page} of ${totalPages}` });

        if (activeEffect) {
            embed.addFields([
                {
                    name: "Active",
                    value: `${EffectDetails.get(activeEffect.Name)?.friendlyName}`,
                    inline: true,
                },
                {
                    name: "Expires",
                    value: `<t:${Math.round(activeEffect.WhenExpires!.getTime() / 1000)}>`,
                    inline: true,
                },
            ]);
        }

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

    public static async GenerateEffectBuyEmbed(userId: string, id: string, quantity: number, disabled: boolean): Promise<{
        embed: EmbedBuilder,
        row: ActionRowBuilder<ButtonBuilder>,
    } | string> {
        const effectDetail = EffectDetails.get(id);

        if (!effectDetail) {
            return "Effect detail not found!";
        }

        const totalCost = effectDetail.cost * quantity;

        let user = await User.FetchOneById(User, userId);

        if (!user) {
            user = new User(userId, CardConstants.StartingCurrency);
            await user.Save(User, user);

            AppLogger.LogInfo("EffectHelper", `Created initial user entity for : ${userId}`);
        }

        if (user.Currency < totalCost) {
            return `You don't have enough currency to buy this! You have \`${user.Currency} Currency\` and need \`${totalCost} Currency\`!`;
        }

        const embed = new EmbedBuilder()
            .setTitle("Buy Effect")
            .setDescription(effectDetail.friendlyName)
            .setColor(EmbedColours.Ok)
            .addFields([
                {
                    name: "Cost",
                    value: `${totalCost}`,
                    inline: true,
                },
                {
                    name: "Quantity",
                    value: `${quantity}`,
                    inline: true,
                },
            ]);

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents([
                new ButtonBuilder()
                    .setCustomId(`effects buy confirm ${id} ${quantity}`)
                    .setLabel("Confirm")
                    .setStyle(ButtonStyle.Success)
                    .setDisabled(disabled),
                new ButtonBuilder()
                    .setCustomId(`effects buy cancel ${id} ${quantity}`)
                    .setLabel("Cancel")
                    .setStyle(ButtonStyle.Danger)
                    .setDisabled(disabled),
            ]);

        return {
            embed,
            row,
        }
    }
}
