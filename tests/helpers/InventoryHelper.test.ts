import InventoryHelper from "../../src/helpers/InventoryHelper";
import { CoreClient } from "../../src/client/client";
import Inventory from "../../src/database/entities/app/Inventory";
import ImageHelper from "../../src/helpers/ImageHelper";
import { CardRarity } from "../../src/constants/CardRarity";

jest.mock("../../src/database/entities/app/Inventory");
jest.mock("../../src/helpers/ImageHelper");
jest.mock("../../src/client/appLogger");

beforeEach(() => {
    jest.resetAllMocks();

    CoreClient.Cards = [
        {
            id: 1,
            name: "Series 1",
            cards: [
                { id: "3", name: "Charlie", type: CardRarity.Gold, path: "card-3.png" },
                { id: "1", name: "Alpha", type: CardRarity.Bronze, path: "card-1.png" },
                { id: "2", name: "Bravo", type: CardRarity.Silver, path: "card-2.png" },
            ],
        },
    ];

    (Inventory.FetchAllByUserId as jest.Mock).mockResolvedValue([
        { CardNumber: "1", Quantity: 1 },
        { CardNumber: "2", Quantity: 1 },
        { CardNumber: "3", Quantity: 1 },
    ]);

    (ImageHelper.GenerateCardImageGrid as jest.Mock).mockResolvedValue(Buffer.from("image"));
});

describe("ParseSortBy", () => {
    test("GIVEN sortBy is name, EXPECT name returned", () => {
        const result = InventoryHelper.ParseSortBy("name");

        expect(result).toBe("name");
    });

    test("GIVEN sortBy is invalid, EXPECT id returned", () => {
        const result = InventoryHelper.ParseSortBy("invalid");

        expect(result).toBe("id");
    });
});

describe("GenerateInventoryPage", () => {
    test("GIVEN sortBy is id, EXPECT cards sorted by id and footer contains sort", async () => {
        const result = await InventoryHelper.GenerateInventoryPage("user", "user-id", 0, "id");

        expect(result).toBeDefined();

        const embed = result!.embed.toJSON();

        expect(embed.description).toContain("[1] Alpha");
        expect(embed.description).toContain("[2] Bravo");
        expect(embed.description).toContain("[3] Charlie");
        expect((embed.description || "").indexOf("[1] Alpha")).toBeLessThan((embed.description || "").indexOf("[2] Bravo"));
        expect((embed.description || "").indexOf("[2] Bravo")).toBeLessThan((embed.description || "").indexOf("[3] Charlie"));
        expect(embed.footer?.text).toContain("By ID");
    });

    test("GIVEN sortBy is name, EXPECT cards sorted by name and controls keep selected sort", async () => {
        const result = await InventoryHelper.GenerateInventoryPage("user", "user-id", 0, "name");

        expect(result).toBeDefined();

        const embed = result!.embed.toJSON();

        expect((embed.description || "").indexOf("Alpha")).toBeLessThan((embed.description || "").indexOf("Bravo"));
        expect((embed.description || "").indexOf("Bravo")).toBeLessThan((embed.description || "").indexOf("Charlie"));
        expect(embed.footer?.text).toContain("By NAME");

        const row1 = result!.row1.toJSON();
        const row2 = result!.row2.toJSON();

        expect((row1.components[0] as any).custom_id).toContain(" name");
        expect((row1.components[1] as any).custom_id).toContain(" name");
        expect((row2.components[0] as any).options?.[0].value).toContain(" name");
    });

    test("GIVEN sortBy is type, EXPECT cards sorted by type", async () => {
        const result = await InventoryHelper.GenerateInventoryPage("user", "user-id", 0, "type");

        expect(result).toBeDefined();

        const embed = result!.embed.toJSON();
        const description = embed.description || "";

        expect(description.indexOf("Bronze")).toBeLessThan(description.indexOf("Silver"));
        expect(description.indexOf("Silver")).toBeLessThan(description.indexOf("Gold"));
        expect(embed.footer?.text).toContain("By TYPE");
    });
});
