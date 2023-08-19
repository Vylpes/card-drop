import { readFileSync } from "fs";
import { QueryRunner } from "typeorm";

export default class MigrationHelper {
    public static Up(migrationName: string, version: string, queryFiles: string[], queryRunner: QueryRunner) {
        for (let path of queryFiles) {
            const query = readFileSync(`${process.cwd()}/database/${version}/${migrationName}/Up/${path}.sql`).toString();

            queryRunner.query(query);
        }
    }

    public static Down(migrationName: string, version: string, queryFiles: string[], queryRunner: QueryRunner) {
        for (let path of queryFiles) {
            const query = readFileSync(`${process.cwd()}/database/${version}/${migrationName}/Down/${path}.sql`).toString();

            queryRunner.query(query);
        }
    }
}