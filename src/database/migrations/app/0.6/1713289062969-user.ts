import { MigrationInterface, QueryRunner } from "typeorm";
import MigrationHelper from "../../../../helpers/MigrationHelper";

export class User1713289062969 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        MigrationHelper.Up("1713289062969-user", "0.6", [
            "01-table/User",
        ], queryRunner);
    }

    public async down(): Promise<void> {
    }

}
