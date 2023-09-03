import { DataSource } from "typeorm";
import * as dotenv from "dotenv";

dotenv.config();

const CardDataSource = new DataSource({
    type: "sqlite",
    database: process.env.DB_CARD_FILE!,
    synchronize: process.env.DB_SYNC == "true",
    logging: process.env.DB_LOGGING == "true",
    entities: [
        "dist/database/entities/card/**/*.js",
    ],
    migrations: [
        "dist/database/migrations/card/**/*.js",
    ],
    subscribers: [
        "dist/database/subscribers/card/**/*.js",
    ],
});

export default CardDataSource;