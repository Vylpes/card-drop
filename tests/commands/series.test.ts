import { ChatInputCommandInteraction } from "discord.js";
import Series from "../../src/commands/series";
import GenerateCommandInteractionMock from "../__functions__/discord.js/GenerateCommandInteractionMock";
import { ChatInputCommandInteraction as ChatInputCommandInteractionMock } from "../__types__/discord.js";
import SeriesHelper from "../../src/helpers/SeriesHelper";
import { CoreClient } from "../../src/client/client";

jest.mock("../../src/client/appLogger");
jest.mock("../../src/helpers/SeriesHelper");

let interaction: ChatInputCommandInteractionMock & {
    followUp: jest.Mock,
    reply: jest.Mock,
    options: ChatInputCommandInteractionMock["options"] & {
        get: jest.Mock,
        getBoolean: jest.Mock,
    }
};

beforeEach(() => {
    jest.resetAllMocks();

    interaction = GenerateCommandInteractionMock({
        subcommand: "view",
    }) as unknown as ChatInputCommandInteractionMock & {
        followUp: jest.Mock,
        reply: jest.Mock,
        options: ChatInputCommandInteractionMock["options"] & {
            get: jest.Mock,
            getBoolean: jest.Mock,
        }
    };

    interaction.followUp = jest.fn();
    interaction.reply = jest.fn();
    interaction.options.get = jest.fn().mockReturnValue({ value: "1" });
    interaction.options.getBoolean = jest.fn().mockReturnValue(false);

    CoreClient.Cards = [
        {
            id: 1,
            name: "Series 1",
            cards: [],
        },
    ] as any;

    (SeriesHelper.GenerateSeriesViewPage as jest.Mock).mockResolvedValue({
        embed: { type: "Embed" },
        row: { type: "Row" },
        image: { type: "Image" },
    });
});

describe("execute", () => {
    test("GIVEN view command has disable_colour_filter=true, EXPECT helper called with true", async () => {
        // Arrange
        interaction.options.getBoolean.mockReturnValue(true);

        // Act
        const command = new Series();
        await command.execute(interaction as unknown as ChatInputCommandInteraction);

        // Assert
        expect(interaction.deferReply).toHaveBeenCalledTimes(1);
        expect(SeriesHelper.GenerateSeriesViewPage).toHaveBeenCalledTimes(1);
        expect(SeriesHelper.GenerateSeriesViewPage).toHaveBeenCalledWith(1, 0, "userId", true);
        expect(interaction.followUp).toHaveBeenCalledWith({
            embeds: [ { type: "Embed" } ],
            components: [ { type: "Row" } ],
            files: [ { type: "Image" } ],
        });
    });

    test("GIVEN view command omits disable_colour_filter, EXPECT helper called with false", async () => {
        // Arrange
        interaction.options.getBoolean.mockReturnValue(null);

        // Act
        const command = new Series();
        await command.execute(interaction as unknown as ChatInputCommandInteraction);

        // Assert
        expect(SeriesHelper.GenerateSeriesViewPage).toHaveBeenCalledTimes(1);
        expect(SeriesHelper.GenerateSeriesViewPage).toHaveBeenCalledWith(1, 0, "userId", false);
    });

    test("GIVEN list subcommand, EXPECT list page to be generated", async () => {
        // Arrange
        interaction.options.getSubcommand = jest.fn().mockReturnValue("list");
        (SeriesHelper.GenerateSeriesListPage as jest.Mock).mockReturnValue({
            embed: { type: "Embed" },
            row: { type: "Row" },
        });

        // Act
        const command = new Series();
        await command.execute(interaction as unknown as ChatInputCommandInteraction);

        // Assert
        expect(SeriesHelper.GenerateSeriesListPage).toHaveBeenCalledTimes(1);
        expect(SeriesHelper.GenerateSeriesListPage).toHaveBeenCalledWith(0);
        expect(interaction.reply).toHaveBeenCalledTimes(1);
        expect(interaction.reply).toHaveBeenCalledWith({
            embeds: [ { type: "Embed" } ],
            components: [ { type: "Row" } ],
        });
    });
});
