import AppLogger from "../client/appLogger";
import CardConstants from "../constants/CardConstants";
import User from "../database/entities/app/User";

export default async function GiveCurrency() {
    AppLogger.LogDebug("Timers/GiveCurrency", "Giving currency to every known user");

    const users = await User.FetchAll(User);

    const usersFiltered = users.filter(x => x.Currency < 1000);

    for (const user of usersFiltered) {
        user.AddCurrency(CardConstants.TimerGiveAmount);
    }

    User.SaveAll(User, users);

    AppLogger.LogDebug("Timers/GiveCurrency", `Successfully gave +${CardConstants.TimerGiveAmount} currency to ${usersFiltered.length} users`);
}