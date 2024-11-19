import UserEffect from "../database/entities/app/UserEffect";

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
        const effect = await UserEffect.FetchOneByUserIdAndName(userId, name);
        const now = new Date();

        if (!effect || effect.Unused == 0) {
            return false;
        }

        if (effect.WhenExpires && now < effect.WhenExpires) {
            return false;
        }

        effect.UseEffect(whenExpires);

        await effect.Save(UserEffect, effect);

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
}
