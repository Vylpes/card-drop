import { Column, Entity, ManyToOne } from "typeorm";
import CardBaseEntity from "../../../contracts/CardBaseEntity";
import { CardRarity } from "../../../constants/CardRarity";
import Series from "./Series";
import CardDataSource from "../../dataSources/cardDataSource";

@Entity()
export default class Card extends CardBaseEntity {
    constructor(cardNumber: string, name: string, rarity: CardRarity, path: string, fileName: string, series: Series) {
        super();

        this.CardNumber = cardNumber;
        this.Name = name;
        this.Rarity = rarity;
        this.Path = path;
        this.FileName = fileName;
        this.Series = series;
    }

    @Column()
    CardNumber: string;

    @Column()
    Name: string;

    @Column()
    Rarity: CardRarity;

    @Column()
    Path: string;

    @Column()
    FileName: string;

    @ManyToOne(() => Series, x => x.Cards)
    Series: Series;

    public static async FetchOneByCardNumber(cardNumber: string, relations?: string[]): Promise<Card | null> {
        const repository = CardDataSource.getRepository(Card);

        const single = await repository.findOne({ where: { CardNumber: cardNumber }, relations: relations || [] });

        return single;
    }

    public static async FetchAllByRarity(rarity: CardRarity, relations?: string[]): Promise<Card[]> {
        const repository = CardDataSource.getRepository(Card);

        const all = await repository.find({ where: { Rarity: rarity }, relations: relations || [] });

        return all;
    }
}