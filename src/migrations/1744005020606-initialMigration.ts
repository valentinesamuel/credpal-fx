import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1744005020606 implements MigrationInterface {
  name = "InitialMigration1744005020606";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "is_verified" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_5537e48c73a7b62d55bee1373e4" UNIQUE ("email", "first_name", "last_name"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e12875dfb3b1d92d7d7c5377e2" ON "user" ("email") `,
    );
    await queryRunner.query(
      `CREATE TABLE "country" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "phone_code" character varying NOT NULL, "iso_alpha_two_code" character varying NOT NULL, "iso_alpha_three_code" character varying NOT NULL, "subdivision_link" character varying NOT NULL, CONSTRAINT "PK_bf6e37c231c4f4ea56dcd887269" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "currency" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "code" character varying NOT NULL, "country_id" uuid NOT NULL, "rate" numeric(10,2) NOT NULL, "symbol" character varying NOT NULL, CONSTRAINT "PK_3cda65c731a6264f0e444cc9b91" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "transaction" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "source_wallet_id" character varying NOT NULL, "destination_wallet_id" character varying NOT NULL, "type" character varying NOT NULL, "source_currency_id" character varying NOT NULL, "destination_currency_id" character varying NOT NULL, "amount" integer NOT NULL, "exchange_rate" numeric NOT NULL, "status" character varying NOT NULL, "reference_id" character varying NOT NULL, "metadata" json NOT NULL, "initialized_at" TIME WITH TIME ZONE NOT NULL, "completed_at" TIME WITH TIME ZONE NOT NULL, "sourceWalletId" uuid, "destinationWalletId" uuid, "sourceCurrencyId" uuid, "destinationCurrencyId" uuid, CONSTRAINT "PK_89eadb93a89810556e1cbcd6ab9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_aed986d28887202eb663778efd" ON "transaction" ("source_wallet_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_e4dc1febe822555d6be7ced3ea" ON "transaction" ("destination_wallet_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "wallet" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "user_id" uuid NOT NULL, "status" character varying NOT NULL, CONSTRAINT "PK_bec464dd8d54c39c54fd32e2334" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_72548a47ac4a996cd254b08252" ON "wallet" ("user_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "wallet_balance" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "wallet_id" uuid NOT NULL, "currency_id" uuid NOT NULL, "amount" integer NOT NULL, "available_amount" integer NOT NULL, CONSTRAINT "REL_624cd19fdf2efa9b27e8769fe9" UNIQUE ("wallet_id"), CONSTRAINT "PK_ec31e88796415d49a1ee8d821f8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "otp" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "pin_id" character varying NOT NULL, "expires_at" TIME WITH TIME ZONE NOT NULL, "is_active" boolean NOT NULL, "email" character varying NOT NULL, "user_id" uuid NOT NULL, CONSTRAINT "PK_32556d9d7b22031d7d0e1fd6723" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "currency" ADD CONSTRAINT "FK_778766e3423005020c18e74c183" FOREIGN KEY ("country_id") REFERENCES "country"("id") ON DELETE NO ACTION ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "transaction" ADD CONSTRAINT "FK_4dbaac33d5403f462da6cdeaac6" FOREIGN KEY ("sourceWalletId") REFERENCES "wallet"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transaction" ADD CONSTRAINT "FK_f18fc08c86f38e846624e3526e9" FOREIGN KEY ("destinationWalletId") REFERENCES "wallet"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transaction" ADD CONSTRAINT "FK_491b1de7182f6f13543328637ae" FOREIGN KEY ("sourceCurrencyId") REFERENCES "currency"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transaction" ADD CONSTRAINT "FK_6ca6b6d82aef3700e57b1702937" FOREIGN KEY ("destinationCurrencyId") REFERENCES "currency"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet" ADD CONSTRAINT "FK_72548a47ac4a996cd254b082522" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_balance" ADD CONSTRAINT "FK_93c713cdc22e7ef1fdf2361698c" FOREIGN KEY ("currency_id") REFERENCES "currency"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_balance" ADD CONSTRAINT "FK_624cd19fdf2efa9b27e8769fe9e" FOREIGN KEY ("wallet_id") REFERENCES "wallet"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "otp" ADD CONSTRAINT "FK_258d028d322ea3b856bf9f12f25" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "otp" DROP CONSTRAINT "FK_258d028d322ea3b856bf9f12f25"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_balance" DROP CONSTRAINT "FK_624cd19fdf2efa9b27e8769fe9e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet_balance" DROP CONSTRAINT "FK_93c713cdc22e7ef1fdf2361698c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet" DROP CONSTRAINT "FK_72548a47ac4a996cd254b082522"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transaction" DROP CONSTRAINT "FK_6ca6b6d82aef3700e57b1702937"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transaction" DROP CONSTRAINT "FK_491b1de7182f6f13543328637ae"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transaction" DROP CONSTRAINT "FK_f18fc08c86f38e846624e3526e9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transaction" DROP CONSTRAINT "FK_4dbaac33d5403f462da6cdeaac6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "currency" DROP CONSTRAINT "FK_778766e3423005020c18e74c183"`,
    );
    await queryRunner.query(`DROP TABLE "otp"`);
    await queryRunner.query(`DROP TABLE "wallet_balance"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_72548a47ac4a996cd254b08252"`,
    );
    await queryRunner.query(`DROP TABLE "wallet"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e4dc1febe822555d6be7ced3ea"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_aed986d28887202eb663778efd"`,
    );
    await queryRunner.query(`DROP TABLE "transaction"`);
    await queryRunner.query(`DROP TABLE "currency"`);
    await queryRunner.query(`DROP TABLE "country"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_e12875dfb3b1d92d7d7c5377e2"`,
    );
    await queryRunner.query(`DROP TABLE "user"`);
  }
}
