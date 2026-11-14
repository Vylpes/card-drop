import { APIButtonComponentWithCustomId } from "discord.js";
import SeriesHelper from "../../src/helpers/SeriesHelper";
import { CoreClient } from "../../src/client/client";
import Inventory from "../../src/database/entities/app/Inventory";
import { CardRarity } from "../../src/constants/CardRarity";
import ImageHelper from "../../src/helpers/ImageHelper";

jest.mock("../../src/database/entities/app/Inventory");
jest.mock("../../src/helpers/ImageHelper");
jest.mock("../../src/client/appLogger");

describe("GenerateSeriesListPage", () => {
    beforeEach(() => {
        CoreClient.Cards = [
            {
                id: 1,
                name: "Series 1",
                cards: [
                    { id: "card1", name: "Card 1", type: CardRarity.Bronze, path: "path1" },
                    { id: "card2", name: "Card 2", type: CardRarity.Silver, path: "path2" },
                    { id: "card3", name: "Card 3", type: CardRarity.Gold, path: "path3" },
                ],
            },
            {
                id: 2,
                name: "Series 2",
                cards: [
                    { id: "card4", name: "Card 4", type: CardRarity.Bronze, path: "path4" },
                    { id: "card5", name: "Card 5", type: CardRarity.Silver, path: "path5" },
                ],
            },
            {
                id: 3,
                name: "Series 3",
                cards: [
                    { id: "card6", name: "Card 6", type: CardRarity.Legendary, path: "path6" },
                ],
            },
        ];
    });

    test("GIVEN user has no claims, EXPECT all series to show 0 claims", async () => {
        // Arrange
        (Inventory.FetchAllByUserId as jest.Mock).mockResolvedValue([]);

        // Act
        const result = await SeriesHelper.GenerateSeriesListPage(0, "userId");

        // Assert
        expect(result).not.toBeNull();
        expect(result!.embed.data.description).toContain("[1] Series 1 (0/3)");
        expect(result!.embed.data.description).toContain("[2] Series 2 (0/2)");
        expect(result!.embed.data.description).toContain("[3] Series 3 (0/1)");
    });

    test("GIVEN user has some claims, EXPECT correct claim counts", async () => {
        // Arrange
        (Inventory.FetchAllByUserId as jest.Mock).mockResolvedValue([
            { CardNumber: "card1", Quantity: 2 },
            { CardNumber: "card2", Quantity: 1 },
            { CardNumber: "card4", Quantity: 1 },
        ]);

        // Act
        const result = await SeriesHelper.GenerateSeriesListPage(0, "userId");

        // Assert
        expect(result).not.toBeNull();
        expect(result!.embed.data.description).toContain("[1] Series 1 (2/3)");
        expect(result!.embed.data.description).toContain("[2] Series 2 (1/2)");
        expect(result!.embed.data.description).toContain("[3] Series 3 (0/1)");
    });

    test("GIVEN user has all cards in a series, EXPECT full claim count", async () => {
        // Arrange
        (Inventory.FetchAllByUserId as jest.Mock).mockResolvedValue([
            { CardNumber: "card1", Quantity: 1 },
            { CardNumber: "card2", Quantity: 1 },
            { CardNumber: "card3", Quantity: 1 },
            { CardNumber: "card4", Quantity: 2 },
            { CardNumber: "card5", Quantity: 3 },
        ]);

        // Act
        const result = await SeriesHelper.GenerateSeriesListPage(0, "userId");

        // Assert
        expect(result).not.toBeNull();
        expect(result!.embed.data.description).toContain("[1] Series 1 (3/3)");
        expect(result!.embed.data.description).toContain("[2] Series 2 (2/2)");
        expect(result!.embed.data.description).toContain("[3] Series 3 (0/1)");
    });

    test("GIVEN multiple pages of series, EXPECT pagination to work correctly", async () => {
        // Arrange - Create 20 series to ensure pagination
        const manySeries = [];
        for (let i = 1; i <= 20; i++) {
            manySeries.push({
                id: i,
                name: `Series ${i}`,
                cards: [
                    { id: `card${i}`, name: `Card ${i}`, type: CardRarity.Bronze, path: `path${i}` },
                ],
            });
        }
        CoreClient.Cards = manySeries;

        (Inventory.FetchAllByUserId as jest.Mock).mockResolvedValue([
            { CardNumber: "card1", Quantity: 1 },
        ]);

        // Act - Get first page
        const result = await SeriesHelper.GenerateSeriesListPage(0, "userId");

        // Assert
        expect(result).not.toBeNull();
        expect(result!.embed.data.description).toContain("[1] Series 1 (1/1)");
        expect(result!.embed.data.description).toContain("[15] Series 15 (0/1)");
        expect(result!.embed.data.description).not.toContain("[16] Series 16");
        expect(result!.row.components[0].data.disabled).toBe(true); // Previous disabled on first page
        expect(result!.row.components[1].data.disabled).toBe(false); // Next enabled
    });

    test("GIVEN second page requested, EXPECT correct series shown", async () => {
        // Arrange - Create 20 series to ensure pagination
        const manySeries = [];
        for (let i = 1; i <= 20; i++) {
            manySeries.push({
                id: i,
                name: `Series ${i}`,
                cards: [
                    { id: `card${i}`, name: `Card ${i}`, type: CardRarity.Bronze, path: `path${i}` },
                ],
            });
        }
        CoreClient.Cards = manySeries;

        (Inventory.FetchAllByUserId as jest.Mock).mockResolvedValue([]);

        // Act - Get second page
        const result = await SeriesHelper.GenerateSeriesListPage(1, "userId");

        // Assert
        expect(result).not.toBeNull();
        expect(result!.embed.data.description).toContain("[16] Series 16 (0/1)");
        expect(result!.embed.data.description).toContain("[20] Series 20 (0/1)");
        expect(result!.embed.data.description).not.toContain("[15] Series 15");
        expect(result!.row.components[0].data.disabled).toBe(false); // Previous enabled
        expect(result!.row.components[1].data.disabled).toBe(true); // Next disabled on last page
    });

    test("GIVEN page beyond total pages, EXPECT null returned", async () => {
        // Arrange
        (Inventory.FetchAllByUserId as jest.Mock).mockResolvedValue([]);

        // Act
        const result = await SeriesHelper.GenerateSeriesListPage(10, "userId");

        // Assert
        expect(result).toBeNull();
    });

    test("GIVEN unclaimed filter, EXPECT only series with missing cards", async () => {
        // Arrange
        (Inventory.FetchAllByUserId as jest.Mock).mockResolvedValue([
            { CardNumber: "card1", Quantity: 1 },
            { CardNumber: "card2", Quantity: 1 },
            { CardNumber: "card3", Quantity: 1 },
            { CardNumber: "card4", Quantity: 1 },
            { CardNumber: "card5", Quantity: 1 },
        ]);

        // Act
        const result = await SeriesHelper.GenerateSeriesListPage(0, "userId", true);

        // Assert
        expect(result).not.toBeNull();
        expect(result!.embed.data.title).toBe("Series (Unclaimed)");
        expect(result!.embed.data.description).toContain("[3] Series 3 (0/1)");
        expect(result!.embed.data.description).not.toContain("Series 1");
        expect(result!.embed.data.description).not.toContain("Series 2");
        expect(result!.row.components).toHaveLength(3);
        const buttons = result!.row.toJSON().components as APIButtonComponentWithCustomId[];
        expect(buttons[2].label).toBe("Back");
    });

    test("GIVEN unclaimed filter and quantity zero inventory, EXPECT series still treated as unclaimed", async () => {
        // Arrange
        (Inventory.FetchAllByUserId as jest.Mock).mockResolvedValue([
            { CardNumber: "card6", Quantity: 0 },
        ]);

        // Act
        const result = await SeriesHelper.GenerateSeriesListPage(0, "userId", true);

        // Assert
        expect(result).not.toBeNull();
        expect(result!.embed.data.description).toContain("[3] Series 3 (0/1)");
    });

    test("GIVEN unclaimed filter with all series complete, EXPECT null returned", async () => {
        // Arrange
        (Inventory.FetchAllByUserId as jest.Mock).mockResolvedValue([
            { CardNumber: "card1", Quantity: 1 },
            { CardNumber: "card2", Quantity: 1 },
            { CardNumber: "card3", Quantity: 1 },
            { CardNumber: "card4", Quantity: 1 },
            { CardNumber: "card5", Quantity: 1 },
            { CardNumber: "card6", Quantity: 1 },
        ]);

        // Act
        const result = await SeriesHelper.GenerateSeriesListPage(0, "userId", true);

        // Assert
        expect(result).toBeNull();
    });

    test("GIVEN unfiltered list, EXPECT Unclaimed button present", async () => {
        // Arrange
        (Inventory.FetchAllByUserId as jest.Mock).mockResolvedValue([]);

        // Act
        const result = await SeriesHelper.GenerateSeriesListPage(0, "userId");

        // Assert
        expect(result).not.toBeNull();
        expect(result!.row.components).toHaveLength(3);
        const buttons = result!.row.toJSON().components as APIButtonComponentWithCustomId[];
        expect(buttons[2].label).toBe("Unclaimed");
        expect(buttons[2].custom_id).toBe("series list 0 1 0");
    });

    test("GIVEN unclaimed filter with return page, EXPECT Back button restores return page", async () => {
        // Arrange
        (Inventory.FetchAllByUserId as jest.Mock).mockResolvedValue([]);

        // Act
        const result = await SeriesHelper.GenerateSeriesListPage(0, "userId", true, 2);

        // Assert
        expect(result).not.toBeNull();
        const buttons = result!.row.toJSON().components as APIButtonComponentWithCustomId[];
        expect(buttons[2].label).toBe("Back");
        expect(buttons[2].custom_id).toBe("series list 2 0");
        expect(buttons[0].custom_id).toBe("series list -1 1 2");
        expect(buttons[1].custom_id).toBe("series list 1 1 2");
    });

    test("GIVEN unclaimed filter across multiple pages, EXPECT pagination over filtered series", async () => {
        // Arrange - 20 incomplete series
        const manySeries = [];
        for (let i = 1; i <= 20; i++) {
            manySeries.push({
                id: i,
                name: `Series ${i}`,
                cards: [
                    { id: `card${i}`, name: `Card ${i}`, type: CardRarity.Bronze, path: `path${i}` },
                ],
            });
        }
        CoreClient.Cards = manySeries;
        (Inventory.FetchAllByUserId as jest.Mock).mockResolvedValue([]);

        // Act
        const result = await SeriesHelper.GenerateSeriesListPage(1, "userId", true, 0);

        // Assert
        expect(result).not.toBeNull();
        expect(result!.embed.data.description).toContain("[16] Series 16 (0/1)");
        expect(result!.embed.data.description).toContain("[20] Series 20 (0/1)");
        expect(result!.embed.data.footer!.text).toContain("Unclaimed");
    });
});

describe("GenerateSeriesViewPage", () => {
    beforeEach(() => {
        CoreClient.Cards = [
            {
                id: 1,
                name: "Test Series",
                cards: [
                    { id: "card1", name: "Card 1", type: CardRarity.Bronze, path: "/path/card1.jpg" },
                    { id: "card2", name: "Card 2", type: CardRarity.Silver, path: "/path/card2.jpg" },
                ],
            },
        ];

        (ImageHelper.GenerateCardImageGrid as jest.Mock).mockResolvedValue(Buffer.from("test"));
        (Inventory.FetchAllByUserId as jest.Mock).mockResolvedValue([]);
    });

    test("GIVEN valid series and page, EXPECT series view page generated", async () => {
        // Act
        const result = await SeriesHelper.GenerateSeriesViewPage(1, 0, "userId");

        // Assert
        expect(result).not.toBeNull();
        expect(result!.embed.data.title).toBe("Test Series · 0% complete");
        expect(result!.embed.data.description).toContain("[card1] Card 1 (Bronze)");
        expect(result!.embed.data.description).toContain("[card2] Card 2 (Silver)");
    });

    test("GIVEN invalid series id, EXPECT null returned", async () => {
        // Act
        const result = await SeriesHelper.GenerateSeriesViewPage(999, 0, "userId");

        // Assert
        expect(result).toBeNull();
    });

    test("GIVEN no claims, EXPECT view title shows 0% complete", async () => {
        (Inventory.FetchAllByUserId as jest.Mock).mockResolvedValue([]);

        const result = await SeriesHelper.GenerateSeriesViewPage(1, 0, "userId");

        expect(result).not.toBeNull();
        expect(result!.embed.data.title).toBe("Test Series · 0% complete");
    });

    test("GIVEN partial series claims, EXPECT view title shows rounded percent", async () => {
        (Inventory.FetchAllByUserId as jest.Mock).mockResolvedValue([
            { CardNumber: "card1", Quantity: 2 },
        ]);

        const result = await SeriesHelper.GenerateSeriesViewPage(1, 0, "userId");

        expect(result).not.toBeNull();
        // 1/2 → 50%
        expect(result!.embed.data.title).toBe("Test Series · 50% complete");
    });

    test("GIVEN all series cards claimed, EXPECT view title shows 100% complete", async () => {
        (Inventory.FetchAllByUserId as jest.Mock).mockResolvedValue([
            { CardNumber: "card1", Quantity: 1 },
            { CardNumber: "card2", Quantity: 3 },
        ]);

        const result = await SeriesHelper.GenerateSeriesViewPage(1, 0, "userId");

        expect(result).not.toBeNull();
        expect(result!.embed.data.title).toBe("Test Series · 100% complete");
    });

    test("GIVEN quantity-zero inventory rows, EXPECT they do not count toward completion", async () => {
        (Inventory.FetchAllByUserId as jest.Mock).mockResolvedValue([
            { CardNumber: "card1", Quantity: 0 },
            { CardNumber: "card2", Quantity: 0 },
        ]);

        const result = await SeriesHelper.GenerateSeriesViewPage(1, 0, "userId");

        expect(result).not.toBeNull();
        expect(result!.embed.data.title).toBe("Test Series · 0% complete");
    });

    test("GIVEN pagination within series, EXPECT title progress stays identical across pages", async () => {
        const cards = [];
        for (let i = 1; i <= 12; i++) {
            cards.push({
                id: `card${i}`,
                name: `Card ${i}`,
                type: CardRarity.Bronze,
                path: `/path/card${i}.jpg`,
            });
        }
        CoreClient.Cards = [
            {
                id: 1,
                name: "Paged Series",
                cards,
            },
        ];
        (Inventory.FetchAllByUserId as jest.Mock).mockResolvedValue([
            { CardNumber: "card1", Quantity: 1 },
            { CardNumber: "card2", Quantity: 1 },
            { CardNumber: "card3", Quantity: 1 },
            { CardNumber: "card4", Quantity: 1 },
        ]);

        const page0 = await SeriesHelper.GenerateSeriesViewPage(1, 0, "userId");
        const page1 = await SeriesHelper.GenerateSeriesViewPage(1, 1, "userId");

        expect(page0).not.toBeNull();
        expect(page1).not.toBeNull();
        // 4/12 → 33%
        expect(page0!.embed.data.title).toBe("Paged Series · 33% complete");
        expect(page1!.embed.data.title).toBe(page0!.embed.data.title);
        expect(page0!.embed.data.description).toContain("[card1]");
        expect(page0!.embed.data.description).not.toContain("[card10]");
        expect(page1!.embed.data.description).toContain("[card10]");
    });
});

describe("SeriesCompletionPercent", () => {
    test("GIVEN empty card list, EXPECT 0", () => {
        expect(SeriesHelper.SeriesCompletionPercent([], new Set(["card1"]))).toBe(0);
    });

    test("GIVEN two of three claimed, EXPECT 67", () => {
        const cards = [{ id: "a" }, { id: "b" }, { id: "c" }];
        expect(SeriesHelper.SeriesCompletionPercent(cards, new Set(["a", "c"]))).toBe(67);
    });
});
