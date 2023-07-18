UPDATE "DeviceSettings"
SET device_setting_value = '{"total-sections":1,"sections":[{"section-name":"test shooting regime","section-starttime":"0","section-order":1,"capture-sequence-type":"manual","capture-interrupt":"ToF-No-Detection","capture-total-images":2,"capture-channel":0,"capture-sequence":[{"img-order":1,"img-exposure-ms":64,"img-led-intensity-ma":0,"img-delay-after-capture-ms":200},{"img-order":2,"img-exposure-ms":125,"img-led-intensity-ma":500,"img-delay-after-capture-ms":200}]}]}'
WHERE device_setting_type = 'DeviceSetting' AND device_setting_name = 'shootingRegime';


UPDATE "GlobalSettings"
SET setting_value = '{"total-sections":1,"sections":[{"section-name":"test shooting regime","section-starttime":"0","section-order":1,"capture-sequence-type":"manual","capture-interrupt":"ToF-No-Detection","capture-total-images":2,"capture-channel":0,"capture-sequence":[{"img-order":1,"img-exposure-ms":64,"img-led-intensity-ma":0,"img-delay-after-capture-ms":200},{"img-order":2,"img-exposure-ms":125,"img-led-intensity-ma":500,"img-delay-after-capture-ms":200}]}]}'
WHERE setting_type = 'DeviceSetting' AND setting_name = 'shootingRegime';
