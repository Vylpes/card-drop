import GetCardsHelper from "../../../src/helpers/DropHelpers/GetCardsHelper";
import EffectHelper from "../../../src/helpers/EffectHelper";
import GetUnclaimedCardsHelper from "../../../src/helpers/DropHelpers/GetUnclaimedCardsHelper";
import CardConstants from "../../../src/constants/CardConstants";

jest.mock("../../../src/helpers/EffectHelper");
jest.mock("../../../src/helpers/DropHelpers/GetUnclaimedCardsHelper");

beforeEach(() => {
    jest.resetAllMocks();
});

describe("FetchCard", () => {
    test("GIVEN user has the unclaimed effect AND unused chance is within constraint, EXPECT unclaimed card returned", async () => {
        // Arrange
        (EffectHelper.HasEffect as jest.Mock).mockResolvedValue(true);
        GetCardsHelper.GetRandomCard = jest.fn();
        Math.random = jest.fn().mockReturnValue(CardConstants.UnusedChanceUpChance - 0.1);

        // Act
        await GetCardsHelper.FetchCard("userId");

        // Assert
        expect(EffectHelper.HasEffect).toHaveBeenCalledTimes(1);
        expect(EffectHelper.HasEffect).toHaveBeenCalledWith("userId", "unclaimed");

        expect(GetUnclaimedCardsHelper.GetRandomCardUnclaimed).toHaveBeenCalledTimes(1);
        expect(GetUnclaimedCardsHelper.GetRandomCardUnclaimed).toHaveBeenCalledWith("userId");

        expect(GetCardsHelper.GetRandomCard).not.toHaveBeenCalled();
    });

    test("GIVEN user has unclaimed effect AND unused chance is NOT within constraint, EXPECT random card returned", async () => {
        // Arrange
        (EffectHelper.HasEffect as jest.Mock).mockResolvedValue(true);
        GetCardsHelper.GetRandomCard = jest.fn();
        Math.random = jest.fn().mockReturnValue(CardConstants.UnusedChanceUpChance + 0.1);

        // Act
        await GetCardsHelper.FetchCard("userId");

        // Assert
        expect(EffectHelper.HasEffect).toHaveBeenCalledTimes(1);
        expect(EffectHelper.HasEffect).toHaveBeenCalledWith("userId", "unclaimed");

        expect(GetCardsHelper.GetRandomCard).toHaveBeenCalledTimes(1);

        expect(GetUnclaimedCardsHelper.GetRandomCardUnclaimed).not.toHaveBeenCalled();
    });

    test("GIVEN user does NOT have unclaimed effect, EXPECT random card returned", async () => {
        // Arrange
        (EffectHelper.HasEffect as jest.Mock).mockResolvedValue(false);
        GetCardsHelper.GetRandomCard = jest.fn();
        Math.random = jest.fn().mockReturnValue(CardConstants.UnusedChanceUpChance + 0.1);

        // Act
        await GetCardsHelper.FetchCard("userId");

        // Assert
        expect(EffectHelper.HasEffect).toHaveBeenCalledTimes(1);
        expect(EffectHelper.HasEffect).toHaveBeenCalledWith("userId", "unclaimed");

        expect(GetCardsHelper.GetRandomCard).toHaveBeenCalledTimes(1);

        expect(GetUnclaimedCardsHelper.GetRandomCardUnclaimed).not.toHaveBeenCalled();
    });
});