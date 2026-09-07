import { Interaction } from "discord.js";
import NewUserDiscovery from "../../../../src/client/interactionCreate/middleware/NewUserDiscovery";
import User from "../../../../src/database/entities/app/User";
import CardConstants from "../../../../src/constants/CardConstants";
import AppLogger from "../../../../src/client/appLogger";

jest.mock("../../../../src/database/entities/app/User");
jest.mock("../../../../src/client/appLogger");

const interaction = { user: { id: "userId" } } as unknown as Interaction;

describe("GIVEN the user is already known", () => {
    beforeAll(async () => {
        jest.resetAllMocks();

        (User.FetchOneById as jest.Mock).mockResolvedValue({ Id: "userId" });

        await NewUserDiscovery(interaction);
    });

    test("EXPECT the user to be looked up", () => {
        expect(User.FetchOneById).toHaveBeenCalledTimes(1);
        expect(User.FetchOneById).toHaveBeenCalledWith(User, "userId");
    });

    test("EXPECT no new user to be created", () => {
        expect(AppLogger.LogInfo).not.toHaveBeenCalled();
    });
});

describe("GIVEN the user is not yet known", () => {
    beforeAll(async () => {
        jest.resetAllMocks();

        (User.FetchOneById as jest.Mock).mockResolvedValue(null);

        await NewUserDiscovery(interaction);
    });

    test("EXPECT a new user to be created with the starting currency", () => {
        expect(User).toHaveBeenCalledWith("userId", CardConstants.StartingCurrency);
    });

    test("EXPECT the new user to be saved", () => {
        const created = (User as unknown as jest.Mock).mock.instances[0];

        expect(created.Save).toHaveBeenCalledTimes(1);
    });

    test("EXPECT the discovery to be logged", () => {
        expect(AppLogger.LogInfo).toHaveBeenCalledWith("NewUserDiscovery", "Discovered new user userId");
    });
});
