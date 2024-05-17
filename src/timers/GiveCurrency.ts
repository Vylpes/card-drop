import AppLogger from "../client/appLogger";
import User from "../database/entities/app/User";

export default async function GiveCurrency() {
    AppLogger.LogInfo("Timers/GiveCurrency", "Giving currency to every known user");

    const users = await User.FetchAll(User);

    for (const user of users) {
        user.AddCurrency(5);
    }

    User.SaveAll(User, users);

    AppLogger.LogInfo("Timers/GiveCurrency", `Successfully gave +5 currency to ${users.length} users`);
}