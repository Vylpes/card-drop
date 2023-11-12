import { existsSync, readdirSync } from "fs";
import CardDataSource from "../database/dataSources/cardDataSource";
import Card from "../database/entities/card/Card";
import Series from "../database/entities/card/Series";
import path from "path";
import { CardRarity, CardRarityToString } from "../constants/CardRarity";
import Config from "../database/entities/app/Config";

export default class CardSetupFunction {
    public static async Execute() {
        if (await Config.GetValue('safemode') == "true") return;

        try {
            await this.ClearDatabase();
            await this.ReadSeries();
            await this.ReadCards();
        } catch {
            await Config.SetValue('safemode', 'true');
        }
    }

    private static async ClearDatabase() {
        const cardRepository = CardDataSource.getRepository(Card);
        await cardRepository.clear();

        const seriesRepository = CardDataSource.getRepository(Series);
        await seriesRepository.clear();
    }

    private static async ReadSeries() {
        const seriesDir = readdirSync(path.join(process.cwd(), 'cards'));

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

    private static async ReadCards() {
        const loadedSeries = await Series.FetchAll(Series, [ "Cards", "Cards.Series" ]);

        const cardRepository = CardDataSource.getRepository(Card);

        const cardsToSave: Card[] = [];

        for (let series of loadedSeries) {
            const cardDirBronze = this.GetCardFiles(CardRarity.Bronze, series);
            const cardDirGold = this.GetCardFiles(CardRarity.Gold, series);
            const cardDirLegendary = this.GetCardFiles(CardRarity.Legendary, series);
            const cardDirSilver = this.GetCardFiles(CardRarity.Silver, series);
            const cardDirManga = this.GetCardFiles(CardRarity.Manga, series);

            cardsToSave.push(
                ...this.GenerateCardData(cardDirBronze, CardRarity.Bronze, series),
                ...this.GenerateCardData(cardDirGold, CardRarity.Gold, series),
                ...this.GenerateCardData(cardDirLegendary, CardRarity.Legendary, series),
                ...this.GenerateCardData(cardDirSilver, CardRarity.Silver, series),
                ...this.GenerateCardData(cardDirManga, CardRarity.Manga, series)
            );
        }

        await cardRepository.save(cardsToSave);

        console.log(`Loaded ${cardsToSave.length} cards to database`);
    }

    private static GenerateCardData(files: string[], rarity: CardRarity, series: Series): Card[] {
        const result: Card[] = [];

        for (let file of files.filter(x => !x.startsWith('.') && (x.endsWith('.png') || x.endsWith('.jpg') || x.endsWith('.gif')))) {
            const filePart = file.split('.');

            const cardId = filePart[0];
            const cardName = filePart[0];

            const card = new Card(cardId, cardName, rarity, path.join(process.cwd(), 'cards', series.Path, CardRarityToString(rarity).toUpperCase(), file), file, series);

            result.push(card);
        }

        return result;
    }

    private static GetCardFiles(rarity: CardRarity, series: Series): string[] {
        const folder = path.join(process.cwd(), 'cards', series.Path, CardRarityToString(rarity).toUpperCase());
        const folderExists = existsSync(folder);

        return folderExists ? readdirSync(folder) : [];
    }
}