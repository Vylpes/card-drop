import DropEmbedHelper from "../../../src/helpers/DropHelpers/DropEmbedHelper";
import AppLogger from "../../../src/client/appLogger";
import { ActionRowBuilder, ButtonBuilder } from "discord.js";
import { DropResult } from "../../../src/contracts/SeriesMetadata";
import { CardRarity } from "../../../src/constants/CardRarity";

jest.mock("../../../src/client/appLogger");

describe("GenerateDropButtons", () => {
    test("EXPECT row to be returned", () => {
        // Arrange
        const drop: DropResult = {
            card: {
                id: "cardId",
                name: "Card Name",
                type: CardRarity.Bronze,
                path: "https://example.com/card.png",
            },
            series: {
                id: 1,
                name: "Series Name",
                cards: [],
            },
        };

        // Act
        const row = DropEmbedHelper.GenerateDropButtons(drop, "claimId", "userId");

        // Assert
        expect(row).toBeDefined();
        expect(row).toBeInstanceOf(ActionRowBuilder);
        expect(row.components).toHaveLength(3);
        expect(row.components[0]).toBeInstanceOf(ButtonBuilder);
    });
});