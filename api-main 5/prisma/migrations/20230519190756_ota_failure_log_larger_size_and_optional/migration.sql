-- AlterTable
ALTER TABLE "DeviceFirmware" ALTER COLUMN "failure_logs" DROP NOT NULL,
ALTER COLUMN "failure_logs" SET DATA TYPE VARCHAR(5000);
