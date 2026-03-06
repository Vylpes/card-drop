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

    (SeriesHelper.GenerateSeriesListPage as jest.Mock).mockReturnValue({
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
            embeds: [ { type: "Embed" } ],
            components: [ { type: "Row" } ],
            files: [ { type: "Image" } ],
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
        expect(SeriesHelper.GenerateSeriesListPage).toHaveBeenCalledWith(3);
        expect(interaction.update).toHaveBeenCalledWith({
            embeds: [ { type: "Embed" } ],
            components: [ { type: "Row" } ],
        });
    });
});
