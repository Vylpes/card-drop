import { MigrationInterface, QueryRunner } from "typeorm";
import MigrationHelper from "../../../../helpers/MigrationHelper";

export class CreateUserEffect1729962056556 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        MigrationHelper.Up("1729962056556-createUserEffect", "0.9", [
            "01-table-userEffect",
        ], queryRunner);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        MigrationHelper.Down("1729962056556-createUserEffect", "0.9", [
            "01-table-userEffect",
        ], queryRunner);
    }

}
