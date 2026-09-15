import { Column, Entity } from "typeorm";
import AppBaseEntity from "../../../contracts/AppBaseEntity";

@Entity()
export default class Multidrop extends AppBaseEntity {
    constructor(userId: string, cardsKept: string[] = [], cardsSacrificed: string[] = []) {
        super();

        this.UserId = userId;
        this.CardsKept = cardsKept;
        this.CardsSacrificed = cardsSacrificed;
    }

    @Column()
        UserId: string;

    @Column("simple-array")
        CardsKept: string[];

    @Column("simple-array")
        CardsSacrificed: string[];

    public Keep(cardNumber: string) {
        this.CardsKept.push(cardNumber);
    }

    public Sacrifice(cardNumber: string) {
        this.CardsSacrificed.push(cardNumber);
    }
}
