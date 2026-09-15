import { ButtonInteraction } from "discord.js";
import Series from "../../src/buttonEvents/Series";
import GenerateButtonInteractionMock from "../__functions__/discord.js/GenerateButtonInteractionMock";
import { ButtonInteraction as ButtonInteractionType } from "../__types__/discord.js";
import SeriesHelper from "../../src/helpers/SeriesHelper";
import { CoreClient } from "../../src/client/client";
import { CardRarity } from "../../src/constants/CardRarity";

jest.mock("../../src/helpers/SeriesHelper");

let interaction: ButtonInteractionType;

beforeEach(() => {
    jest.resetAllMocks();

    interaction = GenerateButtonInteractionMock();
    interaction.customId = "series";

    CoreClient.Cards = [
        {
            id: 1,
            name: "Series 1",
            cards: [
                { id: "card1", name: "Card 1", type: CardRarity.Bronze, path: "path1" },
            ],
        },
    ];
});

describe("list subaction", () => {
    test("GIVEN list subaction, EXPECT GenerateSeriesListPage to be called with userId", async () => {
        // Arrange
        interaction.customId = "series list 0";
        (SeriesHelper.GenerateSeriesListPage as jest.Mock).mockResolvedValue({
            embed: { type: "Embed" },
            row: { type: "Row" },
        });

        // Act
        const series = new Series();
        await series.execute(interaction as unknown as ButtonInteraction);

        // Assert
        expect(SeriesHelper.GenerateSeriesListPage).toHaveBeenCalledTimes(1);
        expect(SeriesHelper.GenerateSeriesListPage).toHaveBeenCalledWith(0, "userId");
    });

    test("GIVEN list subaction, EXPECT interaction to be updated", async () => {
        // Arrange
        interaction.customId = "series list 0";
        (SeriesHelper.GenerateSeriesListPage as jest.Mock).mockResolvedValue({
            embed: { type: "Embed" },
            row: { type: "Row" },
        });

        // Act
        const series = new Series();
        await series.execute(interaction as unknown as ButtonInteraction);

        // Assert
        expect(interaction.update).toHaveBeenCalledTimes(1);
        expect(interaction.update).toHaveBeenCalledWith({
            embeds: [{ type: "Embed" }],
            components: [{ type: "Row" }],
        });
    });

    test("GIVEN list subaction with page 1, EXPECT correct page to be requested", async () => {
        // Arrange
        interaction.customId = "series list 1";
        (SeriesHelper.GenerateSeriesListPage as jest.Mock).mockResolvedValue({
            embed: { type: "Embed" },
            row: { type: "Row" },
        });

        // Act
        const series = new Series();
        await series.execute(interaction as unknown as ButtonInteraction);

        // Assert
        expect(SeriesHelper.GenerateSeriesListPage).toHaveBeenCalledWith(1, "userId");
    });
});

describe("view subaction", () => {
    test("GIVEN view subaction, EXPECT GenerateSeriesViewPage to be called", async () => {
        // Arrange
        interaction.customId = "series view 1 0";
        (SeriesHelper.GenerateSeriesViewPage as jest.Mock).mockResolvedValue({
            embed: { type: "Embed" },
            row: { type: "Row" },
            image: { type: "Image" },
        });

        // Act
        const series = new Series();
        await series.execute(interaction as unknown as ButtonInteraction);

        // Assert
        expect(SeriesHelper.GenerateSeriesViewPage).toHaveBeenCalledTimes(1);
        expect(SeriesHelper.GenerateSeriesViewPage).toHaveBeenCalledWith(1, 0, "userId");
    });

    test("GIVEN view subaction, EXPECT interaction to be updated", async () => {
        // Arrange
        interaction.customId = "series view 1 0";
        (SeriesHelper.GenerateSeriesViewPage as jest.Mock).mockResolvedValue({
            embed: { type: "Embed" },
            row: { type: "Row" },
            image: { type: "Image" },
        });

        // Act
        const series = new Series();
        await series.execute(interaction as unknown as ButtonInteraction);

        // Assert
        expect(interaction.deferUpdate).toHaveBeenCalledTimes(1);
        expect(interaction.editReply).toHaveBeenCalledTimes(1);
        expect(interaction.editReply).toHaveBeenCalledWith({
            embeds: [{ type: "Embed" }],
            components: [{ type: "Row" }],
            files: [{ type: "Image" }],
        });
    });
});
