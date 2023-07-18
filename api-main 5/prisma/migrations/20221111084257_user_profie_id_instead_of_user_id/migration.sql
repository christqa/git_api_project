do $$
declare
   profileId integer := 0;
   dataId integer := 0;
begin
   while (Select Count(*) from "AnalytesManualEntry"
		where profile_id IS NULL) > 0 loop

		SELECT "Profile".id, "AnalytesManualEntry".id INTO profileId, dataId FROM "AnalytesManualEntry"
					LEFT JOIN "Profile" ON "AnalytesManualEntry".user_id = "Profile".user_id
	 				where profile_id is null
					limit 1;

    	UPDATE "AnalytesManualEntry"
			SET profile_id=profileId
			WHERE id = dataId;

   end loop;
end$$;


-- DropForeignKey
ALTER TABLE "AnalytesManualEntry" DROP CONSTRAINT "AnalytesManualEntry_user_id_fkey";

-- DropForeignKey
ALTER TABLE "CumulativeScore" DROP CONSTRAINT "CumulativeScore_user_id_fkey";

-- DropForeignKey
ALTER TABLE "StoolData" DROP CONSTRAINT "StoolData_user_id_fkey";

-- DropForeignKey
ALTER TABLE "UrineData" DROP CONSTRAINT "UrineData_user_id_fkey";

-- AlterTable
ALTER TABLE "AnalytesManualEntry" DROP COLUMN "user_id",
ALTER COLUMN "profile_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "CumulativeScore" DROP COLUMN "user_id",
ALTER COLUMN "profile_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "StoolData" DROP COLUMN "user_id",
ALTER COLUMN "profile_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "UrineData" DROP COLUMN "user_id",
ALTER COLUMN "profile_id" SET NOT NULL;
