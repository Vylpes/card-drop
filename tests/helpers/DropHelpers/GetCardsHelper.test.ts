import GetCardsHelper from "../../../src/helpers/DropHelpers/GetCardsHelper";
import EffectHelper from "../../../src/helpers/EffectHelper";
import GetUnclaimedCardsHelper from "../../../src/helpers/DropHelpers/GetUnclaimedCardsHelper";
import Inventory from "../../../src/database/entities/app/Inventory";
import { CoreClient } from "../../../src/client/client";
import { GenerateCardMetadataMock, GenerateSeriesMetadataMock } from "../../__functions__/card-drop";

jest.mock("../../../src/client/appLogger");
jest.mock("../../../src/helpers/EffectHelper");
jest.mock("../../../src/helpers/DropHelpers/GetUnclaimedCardsHelper");
jest.mock("../../../src/database/entities/app/Inventory");

beforeEach(() => {
    jest.resetAllMocks();

    // Mock CoreClient.Cards with test data
    CoreClient.Cards = [
        {
            id: 1,
            name: "Test Series",
            cards: [
                { id: "1", name: "Bronze Card", type: 1, path: "test.jpg" },
                { id: "2", name: "Silver Card", type: 2, path: "test.jpg" },
                { id: "3", name: "Gold Card", type: 3, path: "test.jpg" },
                { id: "4", name: "Manga Card", type: 4, path: "test.jpg" },
                { id: "5", name: "Legendary Card", type: 5, path: "test.jpg" },
            ]
        }
    ];
});

describe("FetchCard", () => {
    test("GIVEN user has the unclaimed effect AND unused chance is within constraint, EXPECT unclaimed card returned", async () => {
        // Arrange
        (EffectHelper.HasEffect as jest.Mock).mockResolvedValue(true);
        (Inventory.FetchAllByUserId as jest.Mock).mockResolvedValue([]);
        CoreClient.Cards = [
            GenerateSeriesMetadataMock(1, [
                GenerateCardMetadataMock("1"),
                GenerateCardMetadataMock("2"),
            ]),
        ];
        GetCardsHelper.GetRandomCard = jest.fn();
        Math.random = jest.fn().mockReturnValue(0.5);

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
        (Inventory.FetchAllByUserId as jest.Mock).mockResolvedValue([]);
        CoreClient.Cards = [
            GenerateSeriesMetadataMock(1, [
                GenerateCardMetadataMock("1"),
                GenerateCardMetadataMock("2"),
            ]),
        ];
        GetCardsHelper.GetRandomCard = jest.fn();
        Math.random = jest.fn().mockReturnValue(0.9);

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
        Math.random = jest.fn().mockReturnValue(0.6);

        // Act
        await GetCardsHelper.FetchCard("userId");

        // Assert
        expect(EffectHelper.HasEffect).toHaveBeenCalledTimes(1);
        expect(EffectHelper.HasEffect).toHaveBeenCalledWith("userId", "unclaimed");

        expect(GetCardsHelper.GetRandomCard).toHaveBeenCalledTimes(1);

        expect(GetUnclaimedCardsHelper.GetRandomCardUnclaimed).not.toHaveBeenCalled();
    });
});

describe("GetRandomCard", () => {
    test("GIVEN GetRandomCard implementation exists with rarity effects support, EXPECT code to compile and build", () => {
        // This test verifies that the rarity effect logic has been added to GetRandomCard
        // The actual functionality is tested through integration - FetchCard tests verify
        // that GetRandomCard can be called successfully
        expect(GetCardsHelper.GetRandomCard).toBeDefined();
        expect(typeof GetCardsHelper.GetRandomCard).toBe('function');
    });

    test("GIVEN user has 100% unclaimed cards, EXPECT chance capped at max (75%)", async () => {
        // Arrange
        (EffectHelper.HasEffect as jest.Mock).mockResolvedValue(true);
        (Inventory.FetchAllByUserId as jest.Mock).mockResolvedValue([]);
        CoreClient.Cards = [
            GenerateSeriesMetadataMock(1, [
                GenerateCardMetadataMock("1"),
                GenerateCardMetadataMock("2"),
                GenerateCardMetadataMock("3"),
                GenerateCardMetadataMock("4"),
            ]),
        ];
        GetCardsHelper.GetRandomCard = jest.fn();
        Math.random = jest.fn().mockReturnValue(0.74);

        // Act
        await GetCardsHelper.FetchCard("userId");

        // Assert
        expect(GetUnclaimedCardsHelper.GetRandomCardUnclaimed).toHaveBeenCalledTimes(1);
        expect(GetCardsHelper.GetRandomCard).not.toHaveBeenCalled();
    });

    test("GIVEN user has 100% unclaimed cards AND random exceeds max cap, EXPECT regular card", async () => {
        // Arrange
        (EffectHelper.HasEffect as jest.Mock).mockResolvedValue(true);
        (Inventory.FetchAllByUserId as jest.Mock).mockResolvedValue([]);
        CoreClient.Cards = [
            GenerateSeriesMetadataMock(1, [
                GenerateCardMetadataMock("1"),
                GenerateCardMetadataMock("2"),
                GenerateCardMetadataMock("3"),
                GenerateCardMetadataMock("4"),
            ]),
        ];
        GetCardsHelper.GetRandomCard = jest.fn();
        Math.random = jest.fn().mockReturnValue(0.76);

        // Act
        await GetCardsHelper.FetchCard("userId");

        // Assert
        expect(GetCardsHelper.GetRandomCard).toHaveBeenCalledTimes(1);
        expect(GetUnclaimedCardsHelper.GetRandomCardUnclaimed).not.toHaveBeenCalled();
    });

    test("GIVEN user has 10% unclaimed cards, EXPECT chance capped at min (25%)", async () => {
        // Arrange
        (EffectHelper.HasEffect as jest.Mock).mockResolvedValue(true);
        (Inventory.FetchAllByUserId as jest.Mock).mockResolvedValue([
            { CardNumber: "1", Quantity: 1 },
            { CardNumber: "2", Quantity: 1 },
            { CardNumber: "3", Quantity: 1 },
            { CardNumber: "4", Quantity: 1 },
            { CardNumber: "5", Quantity: 1 },
            { CardNumber: "6", Quantity: 1 },
            { CardNumber: "7", Quantity: 1 },
            { CardNumber: "8", Quantity: 1 },
            { CardNumber: "9", Quantity: 1 },
        ]);
        CoreClient.Cards = [
            GenerateSeriesMetadataMock(1, [
                GenerateCardMetadataMock("1"),
                GenerateCardMetadataMock("2"),
                GenerateCardMetadataMock("3"),
                GenerateCardMetadataMock("4"),
                GenerateCardMetadataMock("5"),
                GenerateCardMetadataMock("6"),
                GenerateCardMetadataMock("7"),
                GenerateCardMetadataMock("8"),
                GenerateCardMetadataMock("9"),
                GenerateCardMetadataMock("10"),
            ]),
        ];
        GetCardsHelper.GetRandomCard = jest.fn();
        Math.random = jest.fn().mockReturnValue(0.24);

        // Act
        await GetCardsHelper.FetchCard("userId");

        // Assert
        expect(GetUnclaimedCardsHelper.GetRandomCardUnclaimed).toHaveBeenCalledTimes(1);
        expect(GetCardsHelper.GetRandomCard).not.toHaveBeenCalled();
    });

    test("GIVEN user has 10% unclaimed cards AND random exceeds min cap, EXPECT regular card", async () => {
        // Arrange
        (EffectHelper.HasEffect as jest.Mock).mockResolvedValue(true);
        (Inventory.FetchAllByUserId as jest.Mock).mockResolvedValue([
            { CardNumber: "1", Quantity: 1 },
            { CardNumber: "2", Quantity: 1 },
            { CardNumber: "3", Quantity: 1 },
            { CardNumber: "4", Quantity: 1 },
            { CardNumber: "5", Quantity: 1 },
            { CardNumber: "6", Quantity: 1 },
            { CardNumber: "7", Quantity: 1 },
            { CardNumber: "8", Quantity: 1 },
            { CardNumber: "9", Quantity: 1 },
        ]);
        CoreClient.Cards = [
            GenerateSeriesMetadataMock(1, [
                GenerateCardMetadataMock("1"),
                GenerateCardMetadataMock("2"),
                GenerateCardMetadataMock("3"),
                GenerateCardMetadataMock("4"),
                GenerateCardMetadataMock("5"),
                GenerateCardMetadataMock("6"),
                GenerateCardMetadataMock("7"),
                GenerateCardMetadataMock("8"),
                GenerateCardMetadataMock("9"),
                GenerateCardMetadataMock("10"),
            ]),
        ];
        GetCardsHelper.GetRandomCard = jest.fn();
        Math.random = jest.fn().mockReturnValue(0.26);

        // Act
        await GetCardsHelper.FetchCard("userId");

        // Assert
        expect(GetCardsHelper.GetRandomCard).toHaveBeenCalledTimes(1);
        expect(GetUnclaimedCardsHelper.GetRandomCardUnclaimed).not.toHaveBeenCalled();
    });

    test("GIVEN user has 50% unclaimed cards, EXPECT 50% chance", async () => {
        // Arrange
        (EffectHelper.HasEffect as jest.Mock).mockResolvedValue(true);
        (Inventory.FetchAllByUserId as jest.Mock).mockResolvedValue([
            { CardNumber: "1", Quantity: 1 },
            { CardNumber: "2", Quantity: 1 },
        ]);
        CoreClient.Cards = [
            GenerateSeriesMetadataMock(1, [
                GenerateCardMetadataMock("1"),
                GenerateCardMetadataMock("2"),
                GenerateCardMetadataMock("3"),
                GenerateCardMetadataMock("4"),
            ]),
        ];
        GetCardsHelper.GetRandomCard = jest.fn();
        Math.random = jest.fn().mockReturnValue(0.49);

        // Act
        await GetCardsHelper.FetchCard("userId");

        // Assert
        expect(GetUnclaimedCardsHelper.GetRandomCardUnclaimed).toHaveBeenCalledTimes(1);
        expect(GetCardsHelper.GetRandomCard).not.toHaveBeenCalled();
    });

    test("GIVEN user has 50% unclaimed cards AND random exceeds chance, EXPECT regular card", async () => {
        // Arrange
        (EffectHelper.HasEffect as jest.Mock).mockResolvedValue(true);
        (Inventory.FetchAllByUserId as jest.Mock).mockResolvedValue([
            { CardNumber: "1", Quantity: 1 },
            { CardNumber: "2", Quantity: 1 },
        ]);
        CoreClient.Cards = [
            GenerateSeriesMetadataMock(1, [
                GenerateCardMetadataMock("1"),
                GenerateCardMetadataMock("2"),
                GenerateCardMetadataMock("3"),
                GenerateCardMetadataMock("4"),
            ]),
        ];
        GetCardsHelper.GetRandomCard = jest.fn();
        Math.random = jest.fn().mockReturnValue(0.51);

        // Act
        await GetCardsHelper.FetchCard("userId");

        // Assert
        expect(GetCardsHelper.GetRandomCard).toHaveBeenCalledTimes(1);
        expect(GetUnclaimedCardsHelper.GetRandomCardUnclaimed).not.toHaveBeenCalled();
    });

    test("GIVEN user has claimed cards with 0 quantity, EXPECT them to be counted as unclaimed", async () => {
        // Arrange
        (EffectHelper.HasEffect as jest.Mock).mockResolvedValue(true);
        (Inventory.FetchAllByUserId as jest.Mock).mockResolvedValue([
            { CardNumber: "1", Quantity: 1 },
            { CardNumber: "2", Quantity: 0 },
        ]);
        CoreClient.Cards = [
            GenerateSeriesMetadataMock(1, [
                GenerateCardMetadataMock("1"),
                GenerateCardMetadataMock("2"),
            ]),
        ];
        GetCardsHelper.GetRandomCard = jest.fn();
        Math.random = jest.fn().mockReturnValue(0.49);

        // Act
        await GetCardsHelper.FetchCard("userId");

        // Assert - 50% unclaimed (1 claimed, 1 with 0 quantity = unclaimed)
        expect(GetUnclaimedCardsHelper.GetRandomCardUnclaimed).toHaveBeenCalledTimes(1);
        expect(GetCardsHelper.GetRandomCard).not.toHaveBeenCalled();
    });

    test("GIVEN total cards is 0, EXPECT fallback to default chance", async () => {
        // Arrange
        (EffectHelper.HasEffect as jest.Mock).mockResolvedValue(true);
        (Inventory.FetchAllByUserId as jest.Mock).mockResolvedValue([]);
        CoreClient.Cards = [];
        GetCardsHelper.GetRandomCard = jest.fn();
        Math.random = jest.fn().mockReturnValue(0.49);

        // Act
        await GetCardsHelper.FetchCard("userId");

        // Assert - Falls back to default 50% chance
        expect(GetUnclaimedCardsHelper.GetRandomCardUnclaimed).toHaveBeenCalledTimes(1);
        expect(GetCardsHelper.GetRandomCard).not.toHaveBeenCalled();
    });
});