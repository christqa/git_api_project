# Spectra API

The backend for the Projectspectra nodejs application.

## Get Started

Install the client project dependencies:

```bash
yarn install
```

---

### Set the environment variables:

```bash
cp example.env .env
```

**Or for windows**

```bash
copy example.env .env
```

### Populate `.env` as follows:

```bash
DATABASE_URL=
PORT=
NODE_ENV=
AUTH0_AUDIENCE=
AUTH0_ISSUER=
AUTH0_MANAGEMENT_DOMAIN=
AUTH0_CLIENT_SECRET=
AUTH0_CLIENT_ID=
.....
```

- `PORT` is the port which the application is running, by default is `3000`.
- `DATABASE_URL` is the `PostgreSQL` URL.
- `NODE_ENV` is one of `development`, `production` or `test`
- `AUTH0_AUDIENCE`, `AUTH0_ISSUER`, `AUTH0_MANAGEMENT_DOMAIN`,
  `AUTH0_CLIENT_SECRET` and `AUTH0_CLIENT_ID`, Get the values from your Auth0 API in the Dashboard.

---

## Run the Project

Run the client project

```bash
yarn start
```

**for development**

```bash
yarn run start:dev
```

The application by default runs on port `3000`.

## Swagger UI

Swagger running on the `/api-docs` path

Visit [`http://localhost:3000/api-docs`](http://localhost:3000/api-docs) to view swagger UI.

---

## Migration with Yarn

`yarn migrate`

## Migration with Prisma

**Generate Prisma migration**

```bash
prisma migrate dev --name MIGRATION_NAME
```

**Run Prisma migration**

```bash
prisma migrate dev
```

**Reset Database**

```bash
prisma migrate reset
```

**Format schema**

```bash
prisma format
```

**Browse your data with Prisma Studio**

```shell
prisma studio
```

---

## Notes

Please ensure that in your .env file, `DATABASE_URL` references a Postgres database that you have set up.

For more information on Postgres, visit https://postgresapp.com/.

## Metadata file

the `metadata.json` file is populated during build by the CI/CD system and contains version and build number
information. The `example.metadata.json` file serves as a reference to the schema of metadata.json file.

### version

The `version` field is populated by CI/CD from reading the version field in the `package.json` file. This means for
changing the version of the application the `version` field in `package.json` should be updated and committed to the
repo.

### builsNumber

the `buildNumber` field is generated and injected by CI/CD system, which can be used as a reference later to find more
information about the version of the application and the build process that it went through.
