-- MigrateData
UPDATE "DeviceActivation" SET "battery_status" = CAST("DeviceActivation".device_status::json->>'BatteryStatus' AS INTEGER) WHERE CAST("DeviceActivation".device_status::json->>'BatteryStatus' AS INTEGER) > 0;
