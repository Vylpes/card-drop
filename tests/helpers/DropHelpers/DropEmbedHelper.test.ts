import DropEmbedHelper from "../../../src/helpers/DropHelpers/DropEmbedHelper";
import GenerateCardMetadataMock from "../../__functions__/card-drop/GenerateCardMetadataMock";
import { CardRarity } from "../../../src/constants/CardRarity";

jest.mock("../../../src/client/appLogger");

const drop = {
    series: {
        id: 1,
        name: "Test Series",
        cards: [],
    },
    card: GenerateCardMetadataMock("1001", {
        name: "Test Card",
        type: CardRarity.Bronze,
        path: "https://example.com/card.png",
    }),
};

describe("GenerateDropEmbed", () => {
    test("GIVEN unclaimed drop with dropper EXPECT Dropped by field", () => {
        const embed = DropEmbedHelper.GenerateDropEmbed(drop, 0, "", undefined, 450, "DropperName");

        expect(embed.data.fields).toEqual([
            { name: "Claimed", value: "0", inline: true },
            { name: "Dropped by", value: "DropperName", inline: true },
            { name: "Currency", value: "450", inline: true },
        ]);
        expect(embed.data.fields?.some(field => field.name === "Claimed by")).toBe(false);
    });

    test("GIVEN claimed drop EXPECT Claimed by and no Dropped by", () => {
        const embed = DropEmbedHelper.GenerateDropEmbed(drop, 2, "", "ClaimerName", 400, "DropperName");

        expect(embed.data.fields).toEqual([
            { name: "Claimed", value: "2", inline: true },
            { name: "Claimed by", value: "ClaimerName", inline: true },
            { name: "Currency", value: "400", inline: true },
        ]);
        expect(embed.data.fields?.some(field => field.name === "Dropped by")).toBe(false);
    });

    test("GIVEN no claimer or dropper EXPECT only Claimed and Currency fields", () => {
        const embed = DropEmbedHelper.GenerateDropEmbed(drop, 1, "", undefined, 500);

        expect(embed.data.fields).toEqual([
            { name: "Claimed", value: "1", inline: true },
            { name: "Currency", value: "500", inline: true },
        ]);
    });
});

describe("GenerateDropButtons", () => {
    test.todo("EXPECT row to be returned");
});
