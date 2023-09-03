import { DataSource } from "typeorm";
import * as dotenv from "dotenv";

dotenv.config();

const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_AUTH_USER,
    password: process.env.DB_AUTH_PASS,
    database: process.env.DB_NAME,
    synchronize: process.env.DB_SYNC == "true",
    logging: process.env.DB_LOGGING == "true",
    entities: [
        "dist/database/entities/app/**/*.js",
    ],
    migrations: [
        "dist/database/migrations/app/**/*.js",
    ],
    subscribers: [
        "dist/database/subscribers/app/**/*.js",
    ],
});

export default AppDataSource;