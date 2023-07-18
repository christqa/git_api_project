do $$
declare
   profileId integer := 0;
   dataId integer := 0;
begin
   while (Select Count(*) from "UrineData"
		where profile_id IS NULL) > 0 loop

		SELECT "Profile".id, "UrineData".id INTO profileId, dataId FROM "UrineData"
					LEFT JOIN "Profile" ON "UrineData".user_id = "Profile".user_id
	 				where profile_id is null
					limit 1;

    	UPDATE "UrineData"
			SET profile_id=profileId
			WHERE id = dataId;

   end loop;
end$$;

do $$
declare
   profileId integer := 0;
   dataId integer := 0;
begin
   while (Select Count(*) from "StoolData"
		where profile_id IS NULL) > 0 loop

		SELECT "Profile".id, "StoolData".id INTO profileId, dataId FROM "StoolData"
					LEFT JOIN "Profile" ON "StoolData".user_id = "Profile".user_id
	 				where profile_id is null
					limit 1;

    	UPDATE "StoolData"
			SET profile_id=profileId
			WHERE id = dataId;

   end loop;
end$$;

do $$
declare
   profileId integer := 0;
   dataId integer := 0;
begin
   while (Select Count(*) from "StoolData"
		where profile_id IS NULL) > 0 loop

		SELECT "Profile".id, "StoolData".id INTO profileId, dataId FROM "StoolData"
					LEFT JOIN "Profile" ON "StoolData".user_id = "Profile".user_id
	 				where profile_id is null
					limit 1;

    	UPDATE "StoolData"
			SET profile_id=profileId
			WHERE id = dataId;

   end loop;
end$$;

do $$
declare
   profileId integer := 0;
   dataId integer := 0;
begin
   while (Select Count(*) from "CumulativeScore"
		where profile_id IS NULL) > 0 loop

		SELECT "Profile".id, "CumulativeScore".id INTO profileId, dataId FROM "CumulativeScore"
					LEFT JOIN "Profile" ON "CumulativeScore".user_id = "Profile".user_id
	 				where profile_id is null
					limit 1;

    	UPDATE "CumulativeScore"
			SET profile_id=profileId
			WHERE id = dataId;

   end loop;
end$$;

