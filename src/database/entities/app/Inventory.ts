import { Column, Entity } from "typeorm";
import AppBaseEntity from "../../../contracts/AppBaseEntity";
import AppDataSource from "../../dataSources/appDataSource";

@Entity()
export default class Inventory extends AppBaseEntity {
    constructor(userId: string, cardNumber: string, quantity: number, claimId: string) {
        super();

        this.UserId = userId;
        this.CardNumber = cardNumber;
        this.Quantity = quantity;
        this.ClaimId = claimId;
    }

    @Column()
    UserId: string;

    @Column()
    CardNumber: string;

    @Column()
    Quantity: number;

    @Column()
    ClaimId: string;

    public SetQuantity(quantity: number) {
        this.Quantity = quantity;
    }

    public static async FetchOneByCardNumberAndUserId(userId: string, cardNumber: string): Promise<Inventory | null> {
        const repository = AppDataSource.getRepository(Inventory);

        const single = await repository.findOne({ where: { UserId: userId, CardNumber: cardNumber }});

        return single;
    }

    public static async FetchOneByClaimId(claimId: string): Promise<Inventory | null> {
        const repository = AppDataSource.getRepository(Inventory);

        const single = await repository.findOne({ where: { ClaimId: claimId }});

        return single;
    }
}