DO
$$
BEGIN
  IF NOT EXISTS (SELECT *
                        FROM pg_type typ
                             INNER JOIN pg_namespace nsp
                                        ON nsp.oid = typ.typnamespace
                        WHERE nsp.nspname = current_schema()
                              AND typ.typname = 'InvitationType') THEN
    CREATE TYPE "InvitationType" AS ENUM ('data_sharing', 'join_group');

  END IF;
END;
$$
LANGUAGE plpgsql;


-- AlterTable
ALTER TABLE "Invitations" ADD COLUMN     "invite_type" "InvitationType" NOT NULL DEFAULT E'data_sharing',
ADD COLUMN     "to_group_id" INTEGER;

-- AddForeignKey
ALTER TABLE "Invitations" ADD CONSTRAINT "Invitations_to_group_id_fkey" FOREIGN KEY ("to_group_id") REFERENCES "Groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
