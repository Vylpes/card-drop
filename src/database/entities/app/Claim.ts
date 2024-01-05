import { Column, Entity, ManyToOne } from "typeorm";
import AppBaseEntity from "../../../contracts/AppBaseEntity";
import Inventory from "./Inventory";
import AppDataSource from "../../dataSources/appDataSource";

@Entity()
export default class Claim extends AppBaseEntity {
    constructor(claimId: string) {
        super();

        this.ClaimId = claimId;
    }

    @Column()
        ClaimId: string;

    @ManyToOne(() => Inventory, x => x.Claims)
        Inventory: Inventory;

    public SetInventory(inventory: Inventory) {
        this.Inventory = inventory;
    }

    public static async FetchOneByClaimId(claimId: string): Promise<Claim | null> {
        const repository = AppDataSource.getRepository(Claim);

        const single = await repository.findOne({ where: { ClaimId: claimId }});

        return single;
    }
}