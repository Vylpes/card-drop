import SeriesHelper from "../../src/helpers/SeriesHelper";
import { CoreClient } from "../../src/client/client";
import ImageHelper from "../../src/helpers/ImageHelper";
import { SeriesMetadata } from "../../src/contracts/SeriesMetadata";

jest.mock("../../src/client/appLogger");
jest.mock("../../src/helpers/ImageHelper");

function generateCards(count: number) {
    return Array.from({ length: count }, (_, i) => ({
        id: `card-${i}`,
        name: `Card ${i}`,
        type: 0,
        path: `card-${i}.png`
    }));
}

function generateSeries(id: number, cardCount: number): SeriesMetadata {
    return {
        id,
        name: `Series ${id}`,
        cards: generateCards(cardCount)
    } as unknown as SeriesMetadata;
}

describe("GenerateSeriesViewPage", () => {
    beforeEach(() => {
        jest.resetAllMocks();

        (ImageHelper.GenerateCardImageGrid as jest.Mock).mockResolvedValue(Buffer.from(""));
    });

    describe("GIVEN a series with more cards than fit on a page", () => {
        beforeEach(() => {
            CoreClient.Cards = [ generateSeries(1, 20) ];
        });

        test("EXPECT the first page to hold the first 9 cards", async () => {
            const result = await SeriesHelper.GenerateSeriesViewPage(1, 0, "userId");

            expect(result).not.toBeNull();
            expect(result!.embed.data.description).toContain("[card-0]");
            expect(result!.embed.data.description).toContain("[card-8]");
            expect(result!.embed.data.description).not.toContain("[card-9]");
        });

        test("EXPECT the second page to hold the next 9 cards", async () => {
            const result = await SeriesHelper.GenerateSeriesViewPage(1, 1, "userId");

            expect(result!.embed.data.description).toContain("[card-9]");
            expect(result!.embed.data.description).toContain("[card-17]");
            expect(result!.embed.data.description).not.toContain("[card-8]");
        });

        test("EXPECT paging back and forth to keep returning the same page contents", async () => {
            const first = await SeriesHelper.GenerateSeriesViewPage(1, 0, "userId");
            await SeriesHelper.GenerateSeriesViewPage(1, 1, "userId");
            const firstAgain = await SeriesHelper.GenerateSeriesViewPage(1, 0, "userId");

            expect(firstAgain!.embed.data.description).toBe(first!.embed.data.description);
        });

        test("EXPECT the source series to keep all of its cards", async () => {
            await SeriesHelper.GenerateSeriesViewPage(1, 0, "userId");
            await SeriesHelper.GenerateSeriesViewPage(1, 1, "userId");

            expect(CoreClient.Cards[0].cards).toHaveLength(20);
        });

        test("EXPECT the total card count in the footer to stay stable across pages", async () => {
            await SeriesHelper.GenerateSeriesViewPage(1, 0, "userId");
            const second = await SeriesHelper.GenerateSeriesViewPage(1, 1, "userId");

            expect(second!.embed.data.footer!.text).toBe("1 · 20 cards · Page 2 of 3");
        });
    });

    describe("GIVEN the series does not exist", () => {
        test("EXPECT null returned", async () => {
            CoreClient.Cards = [ generateSeries(1, 5) ];

            expect(await SeriesHelper.GenerateSeriesViewPage(99, 0, "userId")).toBeNull();
        });
    });

    describe("GIVEN the requested page is beyond the last page", () => {
        test("EXPECT null returned", async () => {
            CoreClient.Cards = [ generateSeries(1, 5) ];

            expect(await SeriesHelper.GenerateSeriesViewPage(1, 5, "userId")).toBeNull();
        });
    });
});

describe("GenerateSeriesListPage", () => {
    beforeEach(() => {
        jest.resetAllMocks();

        CoreClient.Cards = Array.from({ length: 20 }, (_, i) => generateSeries(i + 1, 3));
    });

    test("EXPECT the first page to hold the first 15 series", () => {
        const result = SeriesHelper.GenerateSeriesListPage(0);

        expect(result!.embed.data.description).toContain("[1] Series 1");
        expect(result!.embed.data.description).toContain("[15] Series 15");
        expect(result!.embed.data.description).not.toContain("[16] Series 16");
    });

    test("EXPECT the source series list to keep all of its entries", () => {
        SeriesHelper.GenerateSeriesListPage(0);
        SeriesHelper.GenerateSeriesListPage(1);

        expect(CoreClient.Cards).toHaveLength(20);
    });

    test("EXPECT paging back and forth to keep returning the same page contents", () => {
        const first = SeriesHelper.GenerateSeriesListPage(0);
        SeriesHelper.GenerateSeriesListPage(1);
        const firstAgain = SeriesHelper.GenerateSeriesListPage(0);

        expect(firstAgain!.embed.data.description).toBe(first!.embed.data.description);
    });
});
