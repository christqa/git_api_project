-- CreateTable
CREATE TABLE "Agreements" (
    "id" SERIAL NOT NULL,
    "agreement_type" "AgreementTypes" NOT NULL,
    "version" SMALLINT NOT NULL,
    "url" VARCHAR(128) NOT NULL,
    "locale_iso" VARCHAR(128) NOT NULL,

    CONSTRAINT "Agreements_pkey" PRIMARY KEY ("id")
);

INSERT INTO "Agreements" (agreement_type, version, url, locale_iso) 
    VALUES('privacy_policy', 1, 'https://static.projectspectra.dev/privacy/v1.html', 'en');

INSERT INTO "Agreements" (agreement_type, version, url, locale_iso) 
    VALUES('privacy_policy', 2, 'https://static.projectspectra.dev/privacy/v1.html?v=2', 'en');

INSERT INTO "Agreements" (agreement_type, version, url, locale_iso) 
    VALUES('privacy_policy', 3, 'https://static.projectspectra.dev/privacy/v1.html?v=3', 'en');

INSERT INTO "Agreements" (agreement_type, version, url, locale_iso) 
    VALUES('privacy_policy', 4, 'https://static.projectspectra.dev/privacy/v1.html?v=4', 'en');

INSERT INTO "Agreements" (agreement_type, version, url, locale_iso) 
    VALUES('terms_and_conditions', 1, 'https://static.projectspectra.dev/terms/v1.html', 'en');

INSERT INTO "Agreements" (agreement_type, version, url, locale_iso) 
    VALUES('terms_and_conditions', 2, 'https://static.projectspectra.dev/terms/v1.html?v=2', 'en');

INSERT INTO "Agreements" (agreement_type, version, url, locale_iso) 
    VALUES('terms_and_conditions', 3, 'https://static.projectspectra.dev/terms/v1.html?v=3', 'en');

INSERT INTO "Agreements" (agreement_type, version, url, locale_iso) 
    VALUES('terms_and_conditions', 4, 'https://static.projectspectra.dev/terms/v1.html?v=4', 'en');



INSERT INTO "Agreements" (agreement_type, version, url, locale_iso) 
    VALUES('privacy_policy', 1, 'https://static.projectspectra.dev/privacy/v1.html', 'zh');

INSERT INTO "Agreements" (agreement_type, version, url, locale_iso) 
    VALUES('privacy_policy', 2, 'https://static.projectspectra.dev/privacy/v1.html?v=2', 'zh');

INSERT INTO "Agreements" (agreement_type, version, url, locale_iso) 
    VALUES('privacy_policy', 3, 'https://static.projectspectra.dev/privacy/v1.html?v=3', 'zh');

INSERT INTO "Agreements" (agreement_type, version, url, locale_iso) 
    VALUES('privacy_policy', 4, 'https://static.projectspectra.dev/privacy/v1.html?v=4', 'zh');

INSERT INTO "Agreements" (agreement_type, version, url, locale_iso) 
    VALUES('terms_and_conditions', 1, 'https://static.projectspectra.dev/terms/v1.html', 'zh');

INSERT INTO "Agreements" (agreement_type, version, url, locale_iso) 
    VALUES('terms_and_conditions', 2, 'https://static.projectspectra.dev/terms/v1.html?v=2', 'zh');

INSERT INTO "Agreements" (agreement_type, version, url, locale_iso) 
    VALUES('terms_and_conditions', 3, 'https://static.projectspectra.dev/terms/v1.html?v=3', 'zh');

INSERT INTO "Agreements" (agreement_type, version, url, locale_iso) 
    VALUES('terms_and_conditions', 4, 'https://static.projectspectra.dev/terms/v1.html?v=4', 'zh');