import { Column, Entity } from "typeorm";
import AppBaseEntity from "../../../contracts/AppBaseEntity";
import AppDataSource from "../../dataSources/appDataSource";

@Entity()
export default class Config extends AppBaseEntity {
    constructor(key: string, value: string) {
        super();

        this.Key = key;
        this.Value = value;
    }

    @Column()
        Key: string;

    @Column()
        Value: string;

    public SetValue(value: string) {
        this.Value = value;
    }

    public static async FetchOneByKey(key: string): Promise<Config | null> {
        const repository = AppDataSource.getRepository(Config);

        const single = await repository.findOne({ where: { Key: key }});

        return single;
    }

    public static async GetValue(key: string): Promise<string | undefined> {
        const config = await Config.FetchOneByKey(key);

        if (!config) return undefined;

        return config.Value;
    }

    public static async SetValue(key: string, value: string) {
        const config = await Config.FetchOneByKey(key);

        if (!config) {
            const newConfig = new Config(key, value);

            await newConfig.Save(Config, newConfig);
        } else {
            config.SetValue(value);

            await config.Save(Config, config);
        }
    }
}