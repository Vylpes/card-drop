import { existsSync, readdirSync } from "fs";
import CardDataSource from "../database/dataSources/cardDataSource";
import Card from "../database/entities/card/Card";
import Series from "../database/entities/card/Series";
import path from "path";
import { CardRarity } from "../constants/CardRarity";

export default class CardSetupFunction {
    public async Execute() {
        await this.ClearDatabase();
        await this.ReadSeries();
        await this.ReadCards();
    }

    private async ClearDatabase() {
        const cardRepository = CardDataSource.getRepository(Card);
        await cardRepository.clear();

        const seriesRepository = CardDataSource.getRepository(Series);
        await seriesRepository.clear();
    }

    private async ReadSeries() {
        const seriesDir = readdirSync(process.env.CARD_FOLDER!);

        const seriesRepository = CardDataSource.getRepository(Series);

        const seriesToSave: Series[] = [];

        for (let dir of seriesDir) {
            const dirPart = dir.split(' ');

            const seriesId = dirPart.shift();
            const seriesName = dirPart.join(' ');

            const series = new Series(seriesId!, seriesName, dir);

            seriesToSave.push(series);
        }

        await seriesRepository.save(seriesToSave);
    }

    private async ReadCards() {
        const loadedSeries = await Series.FetchAll(Series, [ "Cards", "Cards.Series" ]);

        const cardRepository = CardDataSource.getRepository(Card);

        const cardsToSave: Card[] = [];

        for (let series of loadedSeries) {
            const bronzeExists = existsSync(path.join(process.env.CARD_FOLDER!, series.Path, 'BRONZE'));
            const goldExists = existsSync(path.join(process.env.CARD_FOLDER!, series.Path, 'GOLD'));
            const legendaryExists = existsSync(path.join(process.env.CARD_FOLDER!, series.Path, 'LEGENDARY'));
            const silverExists = existsSync(path.join(process.env.CARD_FOLDER!, series.Path, 'SILVER'));

            const cardDirBronze =  bronzeExists ? readdirSync(path.join(process.env.CARD_FOLDER!, series.Path, 'BRONZE')) : [];
            const cardDirGold = goldExists ? readdirSync(path.join(process.env.CARD_FOLDER!, series.Path, 'GOLD')) : [];
            const cardDirLegendary = legendaryExists ? readdirSync(path.join(process.env.CARD_FOLDER!, series.Path, 'LEGENDARY')) : [];
            const cardDirSilver = silverExists ? readdirSync(path.join(process.env.CARD_FOLDER!, series.Path, 'SILVER')) : [];

            for (let file of cardDirBronze) {
                const filePart = file.split('.');

                const cardId = filePart[0];
                const cardName = filePart[0];

                const card = new Card(cardId, cardName, CardRarity.Bronze, path.join(path.join(process.env.CARD_FOLDER!, series.Path, 'BRONZE', file)), file, series);

                cardsToSave.push(card);
            }

            for (let file of cardDirGold) {
                const filePart = file.split('.');

                const cardId = filePart[0];
                const cardName = filePart[0];

                const card = new Card(cardId, cardName, CardRarity.Gold, path.join(path.join(process.env.CARD_FOLDER!, series.Path, 'GOLD', file)), file, series);

                cardsToSave.push(card);
            }

            for (let file of cardDirLegendary) {
                const filePart = file.split('.');

                const cardId = filePart[0];
                const cardName = filePart[0];

                const card = new Card(cardId, cardName, CardRarity.Legendary, path.join(path.join(process.env.CARD_FOLDER!, series.Path, 'LEGENDARY', file)), file, series);

                cardsToSave.push(card);
            }

            for (let file of cardDirSilver) {
                const filePart = file.split('.');

                const cardId = filePart[0];
                const cardName = filePart[0];

                const card = new Card(cardId, cardName, CardRarity.Silver, path.join(path.join(process.env.CARD_FOLDER!, series.Path, 'SILVER', file)), file, series);

                cardsToSave.push(card);
            }
        }

        await cardRepository.save(cardsToSave);

        console.log(`Loaded ${cardsToSave.length} cards to database`);
    }
}