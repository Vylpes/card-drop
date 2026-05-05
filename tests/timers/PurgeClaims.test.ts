import PurgeClaims from "../../src/timers/PurgeClaims";
import Claim from "../../src/database/entities/app/Claim";
import AppLogger from "../../src/client/appLogger";

jest.mock("../../src/database/entities/app/Claim");
jest.mock("../../src/client/appLogger");

describe("PurgeClaims", () => {
    const currentTime = new Date("2024-01-01T12:00:00Z");
    const twoMinutesAgo = new Date(currentTime.getTime() - (1000 * 60 * 2));

    // Subtract 1ms to ensure this claim falls strictly before the 2-minute cutoff
    const expiredClaim = { WhenCreated: new Date(twoMinutesAgo.getTime() - 1) };
    const recentClaim = { WhenCreated: new Date(currentTime.getTime()) };

    beforeAll(async () => {
        jest.setSystemTime(currentTime);

        (Claim.FetchAll as jest.Mock).mockResolvedValue([expiredClaim, recentClaim]);

        await PurgeClaims();
    });

    test("EXPECT claims to be fetched", () => {
        expect(Claim.FetchAll).toHaveBeenCalledTimes(1);
        expect(Claim.FetchAll).toHaveBeenCalledWith(Claim);
    });

    test("EXPECT Claim.RemoveMany to remove the claims older than 2 minutes", () => {
        expect(Claim.RemoveMany).toHaveBeenCalledTimes(1);
        expect(Claim.RemoveMany).toHaveBeenCalledWith(Claim, [expiredClaim]);
    });

    test("EXPECT info logged", () => {
        expect(AppLogger.LogInfo).toHaveBeenCalledTimes(1);
        expect(AppLogger.LogInfo).toHaveBeenCalledWith("Timers/PurgeClaims", "Purged 1 claims from the database");
    });
});