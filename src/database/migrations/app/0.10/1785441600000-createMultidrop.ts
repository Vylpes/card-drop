import { MigrationInterface, QueryRunner } from "typeorm";
import MigrationHelper from "../../../../helpers/MigrationHelper";

export class CreateMultidrop1785441600000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        MigrationHelper.Up("1785441600000-createMultidrop", "0.10", [
            "01-table-multidrop",
        ], queryRunner);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        MigrationHelper.Down("1785441600000-createMultidrop", "0.10", [
            "01-table-multidrop",
        ], queryRunner);
    }
}
