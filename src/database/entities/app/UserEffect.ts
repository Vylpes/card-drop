import {Column, Entity} from "typeorm";
import AppBaseEntity from "../../../contracts/AppBaseEntity";
import AppDataSource from "../../dataSources/appDataSource";

@Entity()
export default class UserEffect extends AppBaseEntity {
    constructor(name: string, userId: string, unused: number, WhenExpires?: Date) {
        super();

        this.Name = name;
        this.UserId = userId;
        this.Unused = unused;
        this.WhenExpires = WhenExpires;
    }

    @Column()
    Name: string;

    @Column()
    UserId: string;

    @Column()
    Unused: number;

    @Column({ nullable: true })
    WhenExpires?: Date;

    public AddUnused(amount: number) {
        this.Unused += amount;
    }

    public UseEffect(whenExpires: Date): boolean {
        if (this.Unused == 0) {
            return false;
        }

        this.Unused -= 1;
        this.WhenExpires = whenExpires;

        return true;
    }

    public IsEffectActive(): boolean {
        const now = new Date();

        if (this.WhenExpires && now < this.WhenExpires) {
            return true;
        }

        return false;
    }

    public static async FetchOneByUserIdAndName(userId: string, name: string): Promise<UserEffect | null> {
        const repository = AppDataSource.getRepository(UserEffect);

        const single = await repository.findOne({ where: { UserId: userId, Name: name } });

        return single;
    }
}
