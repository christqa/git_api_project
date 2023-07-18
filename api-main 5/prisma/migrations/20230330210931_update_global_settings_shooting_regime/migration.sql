-- update shootingRegime's capture mode
UPDATE "GlobalSettings" SET setting_value = '{"start_capture":"on_proximity_trigger", "capture_mode": "continuous", "capture_interval": "10s", "max_images":"50", "exposure":"25ms", "flashIntensity": "100"}'
  WHERE setting_name = 'shootingRegime';
