-- CreateTable
CREATE TABLE "ReferenceDataVersion" (
    "id" SERIAL NOT NULL,
    "version" INTEGER NOT NULL,

    CONSTRAINT "ReferenceDataVersion_pkey" PRIMARY KEY ("id")
);

-- add ReferenceDataVersion
insert into "ReferenceDataVersion" ("version") values (4);
