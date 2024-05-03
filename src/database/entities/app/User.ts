import { Column, Entity } from "typeorm";
import AppBaseEntity from "../../../contracts/AppBaseEntity";

@Entity()
export default class User extends AppBaseEntity {
    constructor(userId: string, currency: number) {
        super();

        this.Id = userId;
        this.Currency = currency;
    }

    @Column()
        Currency: number;

    public UpdateCurrency(currency: number) {
        this.Currency = currency;
    }

    public RemoveCurrency(amount: number): boolean {
        if (this.Currency < amount) return false;

        this.Currency -= amount;

        return true;
    }
}