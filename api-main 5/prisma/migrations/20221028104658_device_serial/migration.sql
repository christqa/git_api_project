update "DeviceInventory"
set device_serial = LEFT(device_serial, 15)
where length(device_serial) > 15
