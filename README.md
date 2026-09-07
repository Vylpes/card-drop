# Card Drop

Card Drop is a Discord Bot designed to allow users to "drop" random cards into
a channel and have the ability to claim them for themselves or let others if
they so choose.

The cards are randomly chosen based on weights of their card type (i.e. Bronze
is more common than Gold). The user who ran the drop command has 5 minutes to
choose if they want the card to themselves before its claimable by anyone, or
until the drop command is ran again.

## Installation

Downloads of the latest version can be found from the [GitHub Releases](https://github.com/vylpes/card-drop/releases)
or [Forgejo Releases](https://git.vylpes.xyz/external/card-drop/releases) page.

Copy the config template file and fill in the strings.

## Requirements

- NodeJS
- Yarn
- Docker

## Usage

Install the dependencies and build the app:

```bash
yarn install
yarn build
```

Setup the database (Recommended to use the docker-compose file

```bash
docker compose up -d
```

Copy and edit the settings file

```bash
cp .env.example .env
```

> **NOTE:** Make sure you do *not* check in these files! These contain
sensitive information and should be treated as private.

If you're not using `DB_SYNC=true` in `.env`, make sure to migrate the database

```bash
yarn db:up
```

Start the bot

```bash
yarn start
```

## Development

See [docs/development.md](docs/development.md) for how to register new
commands, button events and dropdown events, and what tests are expected
alongside them.

### Tests and linting

The same three commands the CI workflows run, in the same order:

```bash
yarn build   # tsc, type errors fail the build
yarn test    # jest
yarn lint    # eslint .
```

`yarn lint:fix` applies the fixable lint errors. Run all three before opening a
pull request; `.forgejo/workflows/` runs them on every branch, so a failure
here is a failure there.

### Database migrations

Migrations live in `src/database/migrations/app/<version>/` and run against the
*compiled* output, so `yarn build` must come first.

```bash
yarn db:create   # scaffold a new migration in src/database/migrations/app/
yarn build       # compile it into dist/
yarn db:up       # apply pending migrations
yarn db:down     # revert the most recent migration
```

`DB_SYNC=true` in `.env` lets TypeORM create the schema from the entities
instead, which is convenient locally but should not be used against a database
you care about. With `DB_SYNC=false` you must run `yarn db:up` after any entity
change.

### Environment variables

All configuration comes from `.env`, with every supported key listed in
`.env.example`. The keys in `requiredConfigs` in `src/bot.ts` are mandatory and
the bot refuses to start without them. Logger-specific variables are documented
in [docs/logger.md](docs/logger.md), and the card sync variables in
[docs/google-drive-sync.md](docs/google-drive-sync.md).

### Reload webhook

The bot runs a small express server on `EXPRESS_PORT` alongside the Discord
client (`src/webhooks.ts`). It exposes one route:

```
POST /api/reload-db
```

It re-reads the card metadata from `$DATA_DIR/cards` and reloads it into the
bot, which is the same work `/gdrivesync` does after a sync. Useful when cards
have been changed on disk by something other than the bot.

Note that this endpoint is currently unauthenticated, so `EXPRESS_PORT` must
not be exposed to the internet. Token authentication for it is added by
[#512](https://git.vylpes.xyz/External/card-drop/pulls/512), which also adds
`docs/webhooks.md`.

