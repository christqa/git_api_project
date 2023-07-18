-- This is an empty migration.

DELETE FROM "GlobalSettings" WHERE "GlobalSettings".setting_name = 'NFUBattLevel';

INSERT INTO "GlobalSettings" (setting_name, setting_type, setting_value) VALUES ('NFUBattPercent', 'DeviceSetting', '50');