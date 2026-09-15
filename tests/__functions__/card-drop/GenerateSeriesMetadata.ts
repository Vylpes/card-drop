import {CardMetadata} from "../../../src/contracts/SeriesMetadata";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Required to test non-confirmed json data
export default function GenerateSeriesMetadata(id: number, name: string, generateSeries: number = 1, generateCards: number | number[] = 1): any[] {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Required to test non-confirmed json data
    const series: any[] = [];

    for (let s = 0; s < generateSeries; s++) {
        let cards: CardMetadata[] | undefined = [];

        if (typeof generateCards == "number") {
            for (let c = 0; c < generateCards; c++) {
                cards.push({
                    id: `${c}`,
                    name: `Card ${c}`,
                    type: 0,
                    path: `${c}.jpg`,
                });
            }

            if (generateCards == 0) cards = undefined;
        } else if (typeof generateCards == "object") {
            for (let c = 0; c < generateCards[s]; c++) {
                cards.push({
                    id: `${c}`,
                    name: `Card ${c}`,
                    type: 0,
                    path: `${c}.jpg`,
                });
            }

            if (generateCards[s] == 0) cards = undefined;
        }

        series.push({
            id,
            name,
            cards,
        });
    }

    return series;
}
