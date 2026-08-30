import CardConstants from "../../src/constants/CardConstants";
import Multidrop from "../../src/database/entities/app/Multidrop";
import PurgeMultidrops from "../../src/timers/PurgeMultidrops";

jest.mock("../../src/client/appLogger", () => ({
    __esModule: true,
    default: {
        LogInfo: jest.fn(),
    },
}));

describe("PurgeMultidrops", () => {
    test("EXPECT multidrops inactive for longer than the expiry to be removed", async () => {
        const now = new Date("2026-07-30T12:00:00Z");
        jest.setSystemTime(now);

        const expired = new Multidrop("expired-user");
        expired.WhenUpdated = new Date(now.getTime() - CardConstants.MultidropExpiry - 1);

        const active = new Multidrop("active-user");
        active.WhenUpdated = new Date(now.getTime() - CardConstants.MultidropExpiry + 1);

        jest.spyOn(Multidrop, "FetchAll").mockResolvedValue([ expired, active ]);
        const removeMany = jest.spyOn(Multidrop, "RemoveMany").mockResolvedValue();

        await PurgeMultidrops();

        expect(removeMany).toHaveBeenCalledWith(Multidrop, [ expired ]);
    });
});
