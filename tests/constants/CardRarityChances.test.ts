import CardRarityChances from "../../src/constants/CardRarityChances";

describe("CardRarityChances", () => {
    test("Should all chances add up to 100", () => {
        const totalChance = CardRarityChances.Bronze +
            CardRarityChances.Silver +
            CardRarityChances.Gold +
            CardRarityChances.Manga +
            CardRarityChances.Legendary;

        expect(totalChance).toBe(100);
    });
});