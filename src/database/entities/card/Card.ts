import { Column, Entity, ManyToOne } from "typeorm";
import CardBaseEntity from "../../../contracts/CardBaseEntity";
import { CardRarity } from "../../../constants/CardRarity";
import Series from "./Series";

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
}