import { MigrationInterface, QueryRunner } from "typeorm"
import MigrationHelper from "../../../../helpers/MigrationHelper"

export class CreateConfig1699814500650 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        MigrationHelper.Up('1699814500650-createConfig', '0.2', [
            "01-table/Config",
        ], queryRunner);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
