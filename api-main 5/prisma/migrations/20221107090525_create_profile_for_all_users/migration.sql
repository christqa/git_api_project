do $$
declare
   userId integer := 0;
begin
   while (Select Count(*) from "Account"
		LEFT JOIN "Profile" ON "Account".id = "Profile".user_id
		where user_id IS NULL) > 0 loop

		 userId := (Select "Account".id from "Account"
		LEFT JOIN "Profile" ON "Account".id = "Profile".user_id
		where user_id IS NULL
		limit 1);

     INSERT INTO "Profile"(
	dob, weight_lbs, height_in, user_id, gender_id, life_style_id, bowel_movement_id, urinations_per_day_id, exercise_intensity_id, regional_pref)
	VALUES ('01/01/2000', 5, 1, userId, 5, 1, 1, 1, 1, 'en-US');

   end loop;
end$$;
