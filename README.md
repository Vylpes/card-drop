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
yarn Install
yarn build
```

Setup the database (Recommended to use the docker-compose file

```bash
docker compose up -d
```

Copy and edit the settings file

```bash
cp .env.template .env
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

