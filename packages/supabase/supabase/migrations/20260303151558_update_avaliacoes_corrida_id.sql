ALTER TABLE "public"."avaliacoes" ADD COLUMN IF NOT EXISTS "corrida_id" uuid REFERENCES "public"."corridas"("id");
ALTER TABLE "public"."avaliacoes" ALTER COLUMN "solicitacao_id" DROP NOT NULL;
