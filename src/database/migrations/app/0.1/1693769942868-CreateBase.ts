import { MigrationInterface, QueryRunner } from "typeorm"
import MigrationHelper from "../../../../helpers/MigrationHelper"

export class CreateBase1693769942868 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        MigrationHelper.Up('1693769942868-CreateBase', '0.1', [
            "01-table/Inventory",
        ], queryRunner);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
