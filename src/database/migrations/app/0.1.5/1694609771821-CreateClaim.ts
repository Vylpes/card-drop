import { MigrationInterface, QueryRunner } from "typeorm";
import MigrationHelper from "../../../../helpers/MigrationHelper";

export class CreateClaim1694609771821 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        MigrationHelper.Up("1694609771821-CreateClaim", "0.1.5", [
            "01-CreateClaim",
            "02-MoveToClaim",
            "03-AlterInventory",
        ], queryRunner);
    }

    public async down(): Promise<void> {
    }

}
