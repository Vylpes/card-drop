import { Column, Entity, OneToMany } from "typeorm";
import CardBaseEntity from "../../../contracts/CardBaseEntity";
import { CardRarity } from "../../../constants/CardRarity";
import Series from "./Series";
import CardDataSource from "../../dataSources/cardDataSource";

@Entity()
export default class Card extends CardBaseEntity {
    constructor(cardNumber: string, name: string, rarity: CardRarity) {
        super();

        this.CardNumber = cardNumber;
        this.Name = name;
        this.Rarity = rarity;
    }

    @Column()
    CardNumber: string

    @Column()
    Name: string;

    @Column()
    Rarity: CardRarity;

    @OneToMany(() => Series, x => x.Cards)
    Series: Series;

    public static async FetchAllByRarity(rarity: CardRarity): Promise<Card[]> {
        const repository = CardDataSource.getRepository(Card);

        const all = await repository.find({ where: { Rarity: rarity }});

        return all;
    }
}