import { Column, Entity, OneToMany } from "typeorm";
import AppBaseEntity from "../../../contracts/AppBaseEntity";
import AppDataSource from "../../dataSources/appDataSource";
import Claim from "./Claim";

@Entity()
export default class Inventory extends AppBaseEntity {
    constructor(userId: string, cardNumber: string, quantity: number) {
        super();

        this.UserId = userId;
        this.CardNumber = cardNumber;
        this.Quantity = quantity;
    }

    @Column()
        UserId: string;

    @Column()
        CardNumber: string;

    @Column()
        Quantity: number;

    @OneToMany(() => Claim, x => x.Inventory)
        Claims: Claim[];

    public SetQuantity(quantity: number) {
        this.Quantity = quantity;
    }

    public AddClaim(claim: Claim) {
        this.Claims.push(claim);
    }

    public static async FetchOneByCardNumberAndUserId(userId: string, cardNumber: string): Promise<Inventory | null> {
        const repository = AppDataSource.getRepository(Inventory);

        const single = await repository.findOne({ where: { UserId: userId, CardNumber: cardNumber }});

        return single;
    }

    public static async FetchAllByUserId(userId: string): Promise<Inventory[]> {
        const repository = AppDataSource.getRepository(Inventory);

        const all = await repository.find({ where: { UserId: userId }});

        return all;
    }
}