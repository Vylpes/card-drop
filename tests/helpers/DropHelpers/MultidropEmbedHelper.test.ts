import MultidropEmbedHelper from "../../../src/helpers/DropHelpers/MultidropEmbedHelper";
import GetCardsHelper from "../../../src/helpers/DropHelpers/GetCardsHelper";
import GenerateCardMetadataMock from "../../__functions__/card-drop/GenerateCardMetadataMock";

afterEach(() => {
    jest.restoreAllMocks();
});

describe("GenerateSummaryEmbed", () => {
    test("GIVEN kept and sacrificed cards EXPECT summary fields and balance", () => {
        const cardNames: Record<string, string> = {
            "card-1": "Card One",
            "card-2": "Card Two",
            "card-3": "Card Three",
        };
        jest.spyOn(GetCardsHelper, "GetCardByCardNumber").mockImplementation(cardNumber => ({
            series: {
                id: 1,
                name: "Series",
                cards: [],
            },
            card: GenerateCardMetadataMock(cardNumber, { name: cardNames[cardNumber] }),
        }));

        const embed = MultidropEmbedHelper.GenerateSummaryEmbed(
            [ "card-1", "card-2" ],
            [ "card-3" ],
            275);

        expect(embed.data.title).toBe("Multidrop Summary");
        expect(embed.data.fields).toEqual([
            {
                name: "Kept",
                value: "• Card One (card-1)\n• Card Two (card-2)",
                inline: true,
            },
            {
                name: "Sacrificed",
                value: "• Card Three (card-3)",
                inline: true,
            },
            {
                name: "New Balance",
                value: "275 🪙",
            },
        ]);
    });

    test("GIVEN no cards in a section EXPECT None", () => {
        const embed = MultidropEmbedHelper.GenerateSummaryEmbed([], [], 200);

        expect(embed.data.fields?.[0].value).toBe("None");
        expect(embed.data.fields?.[1].value).toBe("None");
    });

    test("GIVEN card metadata is unavailable EXPECT the card number", () => {
        jest.spyOn(GetCardsHelper, "GetCardByCardNumber").mockReturnValue(undefined);

        const embed = MultidropEmbedHelper.GenerateSummaryEmbed([ "card-1" ], [], 200);

        expect(embed.data.fields?.[0].value).toBe("• card-1");
    });
});
