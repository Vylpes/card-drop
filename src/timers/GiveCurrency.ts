import CardConstants from "../constants/CardConstants";
import User from "../database/entities/app/User";

export default async function GiveCurrency() {
    const users = await User.FetchAll(User);

    const usersFiltered = users.filter(x => x.Currency < 1000);

    for (const user of usersFiltered) {
        user.AddCurrency(CardConstants.TimerGiveAmount);
    }

    User.SaveAll(User, users);
}