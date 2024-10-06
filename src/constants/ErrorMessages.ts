export default class ErrorMessages {
    public static readonly BotSyncing = "Bot is currently syncing, please wait until its done.";
    public static readonly SafeMode = "Safe Mode has been activated, please resync to continue.";
    public static readonly UnableToFetchCard = "Unable to fetch card, please try again.";
    public static readonly UnableToFetchUser = "Unable to fetch user, please try again.";

    public static readonly NotEnoughCurrency = (need: number, have: number) => `Not enough currency! You need ${need} currency, you have ${have}!`;
}