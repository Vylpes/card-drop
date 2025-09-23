# Logger

This document will describe how to setup the logger. The logger for the bot is
used to log the output of the bot to a rotating log file, as well as be able to
log to a discord webhook.

We are using [winston](https://www.npmjs.com/package/winston) for the main
logging function, [winston-daily-rotate-file](https://www.npmjs.com/package/winston-daily-rotate-file)
to rotate the log files, and [winston-discord-transport](https://www.npmjs.com/package/winston-discord-transport) to send to discord via a webhook.

## Setup

Setting the logger up is as easy as adding the following environment variables.
Examples are also supplied in `.env.example` in the root of the project.

- `BOT_LOGLEVEL` = The level in which to output logs, default is `info`. Valid
values are `error`, `warn`, `info`, `verbose`, `debug`, and `silly`. Setting
one will show all of that level and above.
- `BOT_LOG_DISCORD_ENABLE` = Enable the discord transport. Default is `false`.
- `BOT_LOG_DISCORD_LEVEL` = The level which to log to discord. Default is
`warn`.
- `BOT_LOG_DISCORD_WEBHOOK` = The webhook url supplied from discord.
- `BOT_LOG_DISCORD_SERVICE` = The name of the service. Such as the bot's name.

## Log Files

The log files are saved to the `logs` directory of the data directory
(`DATA_DIR` environment variable). In the format of `bot-[DATE].log`.

The file will rotate once it reaches 20mb or on a new day, whatever comes
first.

The files will auto delete logs older than 14 days.
