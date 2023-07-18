create or replace function update_to_profile()
returns text
language plpgsql
as
$$
declare 
	err_context text;
begin  

    begin     -- try 
        UPDATE "CumulativeBaselineValue" SET user_id = (SELECT "Profile".id from "Profile" WHERE "CumulativeBaselineValue".user_id = "Profile".user_id);
    exception -- catch 
    when others then
        GET STACKED DIAGNOSTICS err_context = PG_EXCEPTION_CONTEXT;
        RAISE INFO 'Error Name:%',SQLERRM;
        RAISE INFO 'Error State:%', SQLSTATE;
        RAISE INFO 'Error Context:%', err_context;
        return -1;
    end ; -- try..catch

    return 0; 
end;
$$;

ALTER TABLE "CumulativeBaselineValue" DROP CONSTRAINT IF EXISTS "CumulativeBaselineValue_user_id_fkey";

select update_to_profile();

ALTER TABLE "CumulativeBaselineValue" RENAME COLUMN user_id TO profile_id;

ALTER TABLE "CumulativeBaselineValue" ADD CONSTRAINT "CumulativeBaselineValue_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
