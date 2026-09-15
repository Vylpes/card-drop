import { ButtonInteraction } from "discord.js";
import Series from "../../src/buttonEvents/Series";
import GenerateButtonInteractionMock from "../__functions__/discord.js/GenerateButtonInteractionMock";
import { ButtonInteraction as ButtonInteractionType } from "../__types__/discord.js";
import SeriesHelper from "../../src/helpers/SeriesHelper";

jest.mock("../../src/client/appLogger");
jest.mock("../../src/helpers/SeriesHelper");

let interaction: ButtonInteractionType;

beforeEach(() => {
    jest.resetAllMocks();

    interaction = GenerateButtonInteractionMock();

    (SeriesHelper.GenerateSeriesViewPage as jest.Mock).mockResolvedValue({
        embed: { type: "Embed" },
        row: { type: "Row" },
        image: { type: "Image" },
    });

    (SeriesHelper.GenerateSeriesListPage as jest.Mock).mockResolvedValue({
        embed: { type: "Embed" },
        row: { type: "Row" },
    });
});

describe("execute", () => {
    test("GIVEN view customId contains filter flag, EXPECT helper called with true", async () => {
        // Arrange
        interaction.customId = "series view 4 2 1";

        // Act
        const event = new Series();
        await event.execute(interaction as unknown as ButtonInteraction);

        // Assert
        expect(interaction.deferUpdate).toHaveBeenCalledTimes(1);
        expect(SeriesHelper.GenerateSeriesViewPage).toHaveBeenCalledTimes(1);
        expect(SeriesHelper.GenerateSeriesViewPage).toHaveBeenCalledWith(4, 2, "userId", true);
        expect(interaction.editReply).toHaveBeenCalledWith({
            embeds: [{ type: "Embed" }],
            components: [{ type: "Row" }],
            files: [{ type: "Image" }],
        });
    });

    test("GIVEN view customId omits filter flag, EXPECT helper called with false", async () => {
        // Arrange
        interaction.customId = "series view 4 2";

        // Act
        const event = new Series();
        await event.execute(interaction as unknown as ButtonInteraction);

        // Assert
        expect(SeriesHelper.GenerateSeriesViewPage).toHaveBeenCalledTimes(1);
        expect(SeriesHelper.GenerateSeriesViewPage).toHaveBeenCalledWith(4, 2, "userId", false);
    });

    test("GIVEN list customId, EXPECT list helper and interaction update", async () => {
        // Arrange
        interaction.customId = "series list 3";

        // Act
        const event = new Series();
        await event.execute(interaction as unknown as ButtonInteraction);

        // Assert
        expect(SeriesHelper.GenerateSeriesListPage).toHaveBeenCalledTimes(1);
        expect(SeriesHelper.GenerateSeriesListPage).toHaveBeenCalledWith(3, "userId");
        expect(interaction.update).toHaveBeenCalledWith({
            embeds: [{ type: "Embed" }],
            components: [{ type: "Row" }],
        });
    });

    test("GIVEN list customId with page 0, EXPECT GenerateSeriesListPage called with userId", async () => {
        // Arrange
        interaction.customId = "series list 0";

        // Act
        const event = new Series();
        await event.execute(interaction as unknown as ButtonInteraction);

        // Assert
        expect(SeriesHelper.GenerateSeriesListPage).toHaveBeenCalledWith(0, "userId");
    });

    test("GIVEN list customId with page 1, EXPECT correct page to be requested", async () => {
        // Arrange
        interaction.customId = "series list 1";

        // Act
        const event = new Series();
        await event.execute(interaction as unknown as ButtonInteraction);

        // Assert
        expect(SeriesHelper.GenerateSeriesListPage).toHaveBeenCalledWith(1, "userId");
    });

    test("GIVEN view subaction, EXPECT interaction to be updated", async () => {
        // Arrange
        interaction.customId = "series view 1 0";

        // Act
        const event = new Series();
        await event.execute(interaction as unknown as ButtonInteraction);

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
