import { ChatInputCommandInteraction } from "discord.js";
import Series from "../../src/commands/series";
import GenerateCommandInteractionMock from "../__functions__/discord.js/GenerateCommandInteractionMock";
import { ChatInputCommandInteraction as ChatInputCommandInteractionMock } from "../__types__/discord.js";
import { CoreClient } from "../../src/client/client";
import SeriesHelper from "../../src/helpers/SeriesHelper";
import { CardRarity } from "../../src/constants/CardRarity";

jest.mock("../../src/helpers/SeriesHelper");
jest.mock("../../src/client/appLogger");

describe("execute", () => {
    describe("list subcommand", () => {
        let interaction: ChatInputCommandInteractionMock;

        beforeEach(() => {
            CoreClient.Cards = [
                {
                    id: 1,
                    name: "Series 1",
                    cards: [
                        { id: "card1", name: "Card 1", type: CardRarity.Bronze, path: "path1" },
                    ],
                },
            ];

            interaction = GenerateCommandInteractionMock({ subcommand: "list" });

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
        let interaction: ChatInputCommandInteractionMock;

        beforeEach(() => {
            CoreClient.Cards = [
                {
                    id: 1,
                    name: "Series 1",
                    cards: [
                        { id: "card1", name: "Card 1", type: CardRarity.Bronze, path: "path1" },
                    ],
                },
            ];

            interaction = GenerateCommandInteractionMock({ subcommand: "view" });
            (interaction.options.get as jest.Mock).mockReturnValue({ value: "1" });

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
            expect(SeriesHelper.GenerateSeriesViewPage).toHaveBeenCalledWith(1, 0, "userId");
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
            (interaction.options.get as jest.Mock).mockReturnValue({ value: "999" });

            // Act
            const series = new Series();
            await series.execute(interaction as unknown as ChatInputCommandInteraction);

            // Assert
            expect(interaction.followUp).toHaveBeenCalledWith("Series not found.");
        });
    });
});
