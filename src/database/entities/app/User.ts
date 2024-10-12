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

    @Column({ nullable: true })
        LastUsedDaily?: Date;

    public AddCurrency(amount: number) {
        this.Currency += amount;
    }

    public RemoveCurrency(amount: number): boolean {
        if (this.Currency < amount) return false;

        this.Currency -= amount;

        return true;
    }

    public UpdateLastUsedDaily(lastUsedDaily: Date) {
        this.LastUsedDaily = lastUsedDaily;
    }
}