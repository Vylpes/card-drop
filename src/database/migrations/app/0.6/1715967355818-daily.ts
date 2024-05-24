import { MigrationInterface, QueryRunner } from "typeorm";
import MigrationHelper from "../../../../helpers/MigrationHelper";

export class Daily1715967355818 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        MigrationHelper.Up("1715967355818-daily", "0.6", [
            "01-table/User",
        ], queryRunner);
    }

    public async down(): Promise<void> {
    }

}
