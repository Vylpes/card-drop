import { Column, Entity, ManyToOne } from "typeorm";
import CardBaseEntity from "../../../contracts/CardBaseEntity";
import Card from "./Card";

@Entity()
export default class Series extends CardBaseEntity {
    constructor(id: string, name: string, path: string) {
        super();

        this.Id = id;
        this.Name = name;
        this.Path = path;
    }

    @Column()
    Name: string;

    @Column()
    Path: string;

    @ManyToOne(() => Card, x => x.Series)
    Cards: Card[];

    public async AddCard(card: Card) {
        if (!this.Cards) return;

        this.Cards.push(card);
    }
}