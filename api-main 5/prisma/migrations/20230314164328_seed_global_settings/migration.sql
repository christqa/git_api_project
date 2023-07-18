INSERT INTO "GlobalSettings" (setting_name, setting_type, setting_value)
    VALUES('shootingRegime', 'DeviceSetting', '{"start_capture":"on_proximity_trigger", "capture_mode": "continuous/once", "capture_interval": "10s", "max_images":"50", "exposure":"25ms", "flashIntensity": "100"}');

INSERT INTO "GlobalSettings" (setting_name, setting_type, setting_value)
    VALUES('DeviceStatusInterval', 'DeviceSetting', '12h');

INSERT INTO "GlobalSettings" (setting_name, setting_type, setting_value)
    VALUES('DeepSleepInterval', 'DeviceSetting', '60s');

INSERT INTO "GlobalSettings" (setting_name, setting_type, setting_value)
    VALUES('LowPower', 'DeviceSetting', '20');