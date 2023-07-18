/*
  Warnings:

  - A unique constraint covering the columns `[device_serialno]` on the table `DeviceInventory` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "DeviceInventory_device_serialno_key" ON "DeviceInventory"("device_serialno");

-- 'SEEDING' 'DeviceInventory'
insert into "DeviceInventory" ("device_serialno", "manufacturing_date", "device_name", "activated_timezone") VALUES
('e4b0c506-e62a-4418-b5e4-057ea357cedf', '2019-06-01', 'Chester Vega', 'Europe/Isle_of_Man'),
('8ee5d3c6-8c52-466a-83aa-52d1d435015c', '2022-04-03', 'Carlo English', 'America/Argentina/Salta'),
('a6b386c2-3310-402e-869d-0f6c13d9456b', '2021-12-03', 'Lorie Henson', 'America/Mazatlan'),
('07a0b51f-2a7d-4ccc-87cf-ac6a6c838a08', '2022-08-10', 'Bettie Bridges', 'Indian/Reunion'),
('c575658c-5d6f-4c8c-bfae-6c80638a8b7c', '2022-09-09', 'Clark Love', 'Navajo'),
('e6aaa4b0-09cb-4c92-b1f1-ac72cae015e1', '2022-07-10', 'Shana Miles', 'NZ'), 
('acee0d72-5689-4d07-9c3f-da45c679d7a0', '2021-10-09', 'Mildred Hayden', 'America/Mendoza'),
('b51bf175-f917-4a29-8517-02687c44fa42', '2022-10-09', 'Bradford Mejia', 'America/Bahia'),
('fdbdd2ff-0754-4510-bbee-0186d785bfdb', '2022-09-06', 'Randi Guerra', 'Chile/EasterIsland'),
('eb6f589b-610c-4ed9-b60c-37fcfd19d9d3', '2021-10-10', 'Jamel Cordova', 'Pacific/Pohnpei'),
('6ea96b5b-871f-4994-9126-0a75df0dfa08', '2022-03-09', 'Adolfo Duffy', 'America/Argentina/Tucuman'),
('c87288d2-1528-4284-a9f3-7f3e1358afa0', '2022-06-05', 'Bettie Bridges', 'Indian/Reunion'),
('3cb5946f-0891-49e0-93c4-86ce84a06c4a', '2022-04-03', 'Tyrell Bowen', 'Europe/Brussels'),
('6679f1e3-4904-4ab3-839e-ec44c195db56', '2022-05-09', 'Shana Miles', 'NZ'), 
('05b2b8d8-a112-45a5-abbf-9f68b9603226', '2022-03-03', 'Shawn Roth', 'America/Coral_Harbour'),
('9a19aff0-fa61-4968-aa5f-6019fee9099b', '2021-03-04', 'Madeleine Flowers', 'US/Mountain'),
('8be21781-7b49-4423-a883-018b92aa2f4d', '2022-07-08', 'Kristine Lewis', 'Asia/Chungking'),
('f83cb307-b86c-480c-af8f-46af318c9eba', '2022-03-09', 'Lela Franco', 'Japan'),
('e816b382-c377-415f-8b47-c68546ff8124', '2022-09-01', 'Maryanne Sherman', 'Europe/Vatican'),
('62ef22eb-3bbc-4a14-accf-09d7f1f87a90', '2022-06-03', 'Bradford Mejia', 'America/Bahia'),
('2dd18414-bc17-428b-9971-027bd3f8ccea', '2022-08-10', 'Tyrell Bowen', 'Europe/Brussels'),
('9cd8f588-340b-4b89-8231-0e94ac920330', '2022-05-10', 'Madeleine Flowers', 'US/Mountain'),
('52a638e3-10f7-4517-a2c1-6bd28f9a6b0b', '2022-04-01', 'Alisa Wang', 'Etc/Greenwich'),
('00886a04-7d9b-447d-a0c7-5124f6999254', '2022-03-03', 'Twila Krause', 'America/Toronto'),
('37c90dbc-25a0-4e3c-ad21-084dcbe69c5a', '2022-08-08', 'Franklin Mccormick', 'Asia/Pyongyang'),
('22db4ec5-f161-43ed-a253-251fcc0ce4f1', '2021-03-01', 'Lucile Pacheco', 'Antarctica/Rothera'),
('87ae2a2e-2b18-4623-b57b-cb6d85dbf261', '2022-04-03', 'Candy Benson', 'America/Miquelon'),
('64532920-cafe-445d-8936-831731f3097e', '2022-07-09', 'Lucile Pacheco', 'Antarctica/Rothera'),
('a12b6b9b-9055-4222-acfd-2106bb722122', '2022-09-05', 'Kim Shah', 'Pacific/Kosrae'),
('d5ab4144-35c1-4e89-8d9f-e8e807dd8b85', '2022-08-21', 'Enid Best', 'Indian/Mauritius'),
('e7361f1b-b3d4-4004-98d3-47007c903569', '2022-07-10', 'Candy Benson', 'America/Miquelon')
