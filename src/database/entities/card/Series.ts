import { Column, Entity, OneToMany } from "typeorm";
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

    @OneToMany(() => Card, x => x.Series)
    Cards: Card[];
}