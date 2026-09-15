import { ChatInputCommandInteraction } from "discord.js";
import Series from "../../src/commands/series";
import GenerateCommandInteractionMock from "../__functions__/discord.js/GenerateCommandInteractionMock";
import { ChatInputCommandInteraction as ChatInputCommandInteractionMock } from "../__types__/discord.js";
import { CoreClient } from "../../src/client/client";
import SeriesHelper from "../../src/helpers/SeriesHelper";
import { CardRarity } from "../../src/constants/CardRarity";

jest.mock("../../src/helpers/SeriesHelper");
jest.mock("../../src/client/appLogger");

type SeriesCommandInteraction = ChatInputCommandInteractionMock & {
    options: ChatInputCommandInteractionMock["options"] & {
        get: jest.Mock,
        getBoolean: jest.Mock,
    }
};

function createInteraction(subcommand: string): SeriesCommandInteraction {
    const interaction = GenerateCommandInteractionMock({ subcommand }) as SeriesCommandInteraction;

    interaction.options.get = jest.fn().mockReturnValue({ value: "1" });
    interaction.options.getBoolean = jest.fn().mockReturnValue(false);

    return interaction;
}

describe("execute", () => {
    describe("list subcommand", () => {
        let interaction: SeriesCommandInteraction;

        beforeEach(() => {
            jest.resetAllMocks();

            CoreClient.Cards = [
                {
                    id: 1,
                    name: "Series 1",
                    cards: [
                        { id: "card1", name: "Card 1", type: CardRarity.Bronze, path: "path1" },
                    ],
                },
            ];

            interaction = createInteraction("list");

            (SeriesHelper.GenerateSeriesListPage as jest.Mock).mockResolvedValue({
                embed: { type: "Embed" },
                row: { type: "Row" },
            });
        });

        test("GIVEN list subcommand, EXPECT GenerateSeriesListPage to be called with userId", async () => {
            // Act
            const series = new Series();
            await series.execute(interaction as unknown as ChatInputCommandInteraction);

            // Assert
            expect(SeriesHelper.GenerateSeriesListPage).toHaveBeenCalledTimes(1);
            expect(SeriesHelper.GenerateSeriesListPage).toHaveBeenCalledWith(0, "userId");
        });

        test("GIVEN list subcommand, EXPECT reply to be sent", async () => {
            // Act
            const series = new Series();
            await series.execute(interaction as unknown as ChatInputCommandInteraction);

            // Assert
            expect(interaction.reply).toHaveBeenCalledTimes(1);
            expect(interaction.reply).toHaveBeenCalledWith({
                embeds: [{ type: "Embed" }],
                components: [{ type: "Row" }],
            });
        });
    });

    describe("view subcommand", () => {
        let interaction: SeriesCommandInteraction;

        beforeEach(() => {
            jest.resetAllMocks();

            CoreClient.Cards = [
                {
                    id: 1,
                    name: "Series 1",
                    cards: [
                        { id: "card1", name: "Card 1", type: CardRarity.Bronze, path: "path1" },
                    ],
                },
            ];

            interaction = createInteraction("view");

            (SeriesHelper.GenerateSeriesViewPage as jest.Mock).mockResolvedValue({
                embed: { type: "Embed" },
                row: { type: "Row" },
                image: { type: "Image" },
            });
        });

        test("GIVEN view subcommand with valid id, EXPECT GenerateSeriesViewPage to be called", async () => {
            // Act
            const series = new Series();
            await series.execute(interaction as unknown as ChatInputCommandInteraction);

            // Assert
            expect(SeriesHelper.GenerateSeriesViewPage).toHaveBeenCalledTimes(1);
            expect(SeriesHelper.GenerateSeriesViewPage).toHaveBeenCalledWith(1, 0, "userId", false);
        });

        test("GIVEN view command has disable_colour_filter=true, EXPECT helper called with true", async () => {
            // Arrange
            interaction.options.getBoolean.mockReturnValue(true);

            // Act
            const series = new Series();
            await series.execute(interaction as unknown as ChatInputCommandInteraction);

            // Assert
            expect(interaction.deferReply).toHaveBeenCalledTimes(1);
            expect(SeriesHelper.GenerateSeriesViewPage).toHaveBeenCalledTimes(1);
            expect(SeriesHelper.GenerateSeriesViewPage).toHaveBeenCalledWith(1, 0, "userId", true);
            expect(interaction.followUp).toHaveBeenCalledWith({
                embeds: [{ type: "Embed" }],
                components: [{ type: "Row" }],
                files: [{ type: "Image" }],
            });
        });

        test("GIVEN view command omits disable_colour_filter, EXPECT helper called with false", async () => {
            // Arrange
            interaction.options.getBoolean.mockReturnValue(null);

            // Act
            const series = new Series();
            await series.execute(interaction as unknown as ChatInputCommandInteraction);

            // Assert
            expect(SeriesHelper.GenerateSeriesViewPage).toHaveBeenCalledTimes(1);
            expect(SeriesHelper.GenerateSeriesViewPage).toHaveBeenCalledWith(1, 0, "userId", false);
        });

        test("GIVEN view subcommand with valid id, EXPECT followUp to be sent", async () => {
            // Act
            const series = new Series();
            await series.execute(interaction as unknown as ChatInputCommandInteraction);

            // Assert
            expect(interaction.deferReply).toHaveBeenCalledTimes(1);
            expect(interaction.followUp).toHaveBeenCalledTimes(1);
            expect(interaction.followUp).toHaveBeenCalledWith({
                embeds: [{ type: "Embed" }],
                components: [{ type: "Row" }],
                files: [{ type: "Image" }],
            });
        });

        test("GIVEN view subcommand with invalid id, EXPECT series not found message", async () => {
            // Arrange
            interaction.options.get.mockReturnValue({ value: "999" });

            // Act
            const series = new Series();
            await series.execute(interaction as unknown as ChatInputCommandInteraction);

            // Assert
            expect(interaction.followUp).toHaveBeenCalledWith("Series not found.");
        });
    });
});
