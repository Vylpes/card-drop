import { Column, DeepPartial, EntityTarget, PrimaryColumn, ObjectLiteral, FindOptionsWhere } from "typeorm";
import { v4 } from "uuid";
import AppDataSource from "../database/dataSources/appDataSource";

export default class BaseEntity {
    constructor() {
        this.Id = v4();

        this.WhenCreated = new Date();
        this.WhenUpdated = new Date();
    }

    @PrimaryColumn()
    Id: string;

    @Column()
    WhenCreated: Date;

    @Column()
    WhenUpdated: Date;

    public async Save<T extends BaseEntity>(target: EntityTarget<T>, entity: DeepPartial<T>): Promise<void> {
        this.WhenUpdated = new Date();

        const repository = AppDataSource.getRepository<T>(target);

        await repository.save(entity);
    }

    public static async Remove<T extends BaseEntity>(target: EntityTarget<T>, entity: T): Promise<void> {
        const repository = AppDataSource.getRepository<T>(target);

        await repository.remove(entity);
    }

    public static async FetchAll<T extends BaseEntity>(target: EntityTarget<T>, relations?: string[]): Promise<T[]> {
        const repository = AppDataSource.getRepository<T>(target);

        const all = await repository.find({ relations: relations || [] });

        return all;
    }

    public static async FetchOneById<T extends BaseEntity>(target: EntityTarget<T>, id: string, relations?: string[]): Promise<T | null> {
        const repository = AppDataSource.getRepository<T>(target);

        const single = await repository.findOne({ where: ({ Id: id } as FindOptionsWhere<T>), relations: relations || {} });

        return single;
    }

    public static async Any<T extends ObjectLiteral>(target: EntityTarget<T>): Promise<boolean> {
        const repository = AppDataSource.getRepository<T>(target);

        const any = await repository.find();

        return any.length > 0;
    }
}