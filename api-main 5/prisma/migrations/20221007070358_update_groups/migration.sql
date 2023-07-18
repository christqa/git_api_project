-- AlterTable
ALTER TABLE "Events" ALTER COLUMN "generated_on" SET DATA TYPE TIMESTAMPTZ(3);

-- AlterTable
TRUNCATE "GroupUsers";
ALTER TABLE "GroupUsers" DROP COLUMN "group_user_roles",
ADD COLUMN     "deleted" TIMESTAMPTZ(3),
ADD COLUMN     "group_user_role" "GroupUserRoles" NOT NULL,
ALTER COLUMN "added_on" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "added_on" SET DATA TYPE TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "Groups" ADD COLUMN     "created_by" INTEGER NOT NULL,
ADD COLUMN     "deleted" TIMESTAMPTZ(3),
ADD COLUMN     "deleted_by" INTEGER,
ALTER COLUMN "created_on" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "created_on" SET DATA TYPE TIMESTAMPTZ(3);

-- CreateTable
CREATE TABLE "GroupDevices" (
    "id" SERIAL NOT NULL,
    "group_id" INTEGER NOT NULL,
    "device_id" INTEGER NOT NULL,
    "added_by" INTEGER NOT NULL,
    "added_on" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "removed_by" INTEGER,
    "deleted" TIMESTAMPTZ(3),

    CONSTRAINT "GroupDevices_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GroupDevices" ADD CONSTRAINT "GroupDevices_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "DeviceInventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupDevices" ADD CONSTRAINT "GroupDevices_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "Groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupDevices" ADD CONSTRAINT "GroupDevices_added_by_fkey" FOREIGN KEY ("added_by") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupDevices" ADD CONSTRAINT "GroupDevices_removed_by_fkey" FOREIGN KEY ("removed_by") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Groups" ADD CONSTRAINT "Groups_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Groups" ADD CONSTRAINT "Groups_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- MigrateData
--  >Groups
ALTER TABLE "Groups" ADD COLUMN "device_id" INTEGER NULL;
INSERT INTO "Groups" ("group_name", "device_id", "created_by")
SELECT CONCAT('home no', "id") AS "group_name", "device_id", "activated_by" FROM "DeviceActivation" WHERE "deleted" IS NULL AND "device_id" IN (SELECT DISTINCT "device_id" FROM "UserDevices") ORDER BY "id" ASC;

--  >GroupDevices
INSERT INTO "GroupDevices" ("group_id", "device_id", "added_by")
SELECT "id", "device_id", "created_by" FROM "Groups" ORDER BY "id" ASC;

--  >GroupUsers
INSERT INTO "GroupUsers" ("user_id", "group_id", "group_user_role")
SELECT "UserDevices"."user_id", "Groups"."id", CASE WHEN "Groups"."created_by" = "UserDevices"."user_id" THEN CAST('owner' AS "GroupUserRoles") ELSE CAST('member' AS "GroupUserRoles") END AS "group_user_role" FROM "UserDevices" LEFT JOIN "Groups" ON "Groups"."device_id" = "UserDevices"."device_id" ORDER BY "UserDevices"."id" ASC;

ALTER TABLE "Groups" DROP COLUMN "device_id";

-- DropForeignKey
ALTER TABLE "UserDevices" DROP CONSTRAINT "UserDevices_device_id_fkey";

-- DropForeignKey
ALTER TABLE "UserDevices" DROP CONSTRAINT "UserDevices_user_id_fkey";

-- DropTable
DROP TABLE "UserDevices";
