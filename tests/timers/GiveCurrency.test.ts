import GiveCurrency from "../../src/timers/GiveCurrency";
import User from "../../src/database/entities/app/User";
import CardConstants from "../../src/constants/CardConstants";
import AppLogger from "../../src/client/appLogger";

jest.mock("../../src/database/entities/app/User");
jest.mock("../../src/client/appLogger");

describe("GIVEN a mix of users above and below the currency cap", () => {
    let poorUser: User;
    let richUser: User;

    beforeAll(async () => {
        jest.resetAllMocks();

        poorUser = { Currency: 500, AddCurrency: jest.fn() } as unknown as User;
        richUser = { Currency: 1000, AddCurrency: jest.fn() } as unknown as User;

        (User.FetchAll as jest.Mock).mockResolvedValue([poorUser, richUser]);

        await GiveCurrency();
    });

    test("EXPECT all users to be fetched", () => {
        expect(User.FetchAll).toHaveBeenCalledTimes(1);
        expect(User.FetchAll).toHaveBeenCalledWith(User);
    });

    test("EXPECT users below the cap to be given currency", () => {
        expect(poorUser.AddCurrency).toHaveBeenCalledTimes(1);
        expect(poorUser.AddCurrency).toHaveBeenCalledWith(CardConstants.TimerGiveAmount);
    });

    test("EXPECT users at or above the cap to be skipped", () => {
        expect(richUser.AddCurrency).not.toHaveBeenCalled();
    });

    test("EXPECT all users to be saved", () => {
        expect(User.SaveAll).toHaveBeenCalledTimes(1);
        expect(User.SaveAll).toHaveBeenCalledWith(User, [poorUser, richUser]);
    });

    test("EXPECT the number of users given currency to be logged", () => {
        expect(AppLogger.LogDebug).toHaveBeenCalledWith("Timers/GiveCurrency", `Successfully gave +${CardConstants.TimerGiveAmount} currency to 1 users`);
    });
});

describe("GIVEN there are no users", () => {
    beforeAll(async () => {
        jest.resetAllMocks();

        (User.FetchAll as jest.Mock).mockResolvedValue([]);

        await GiveCurrency();
    });

    test("EXPECT nothing to fail and an empty save to still be made", () => {
        expect(User.SaveAll).toHaveBeenCalledTimes(1);
        expect(User.SaveAll).toHaveBeenCalledWith(User, []);
    });
});
