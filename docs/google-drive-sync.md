# Google Drive Sync

The bot relies on an external sync between the local file system and Google
Drive in order to get newer cards to the bot. This is done using
[Rclone](https://rclone.org/).

The process for this is done by once the `/gdrivesync` command is executed by
an admin user of the bot, which calls the system shell to run rclone to the
card folder.

- The admins who can run the command is specifed in `$BOT_ADMINS`, which are
discord user ids separated by commas.
- The card folder is located at `$DATA_DIR/cards`.
- The source requires rclone's remote to be setup as `card-drop-gdrive`.

The exact command it runs is: `rclone sync card-drop-gdrive: $DATA_DIR/cards`.

Once it syncs the database will reread all the cards for updates and then load
them into the bot to be given.

## Safe Mode
Safe mode is a function of the bot which disables the `/drop` command function
and any other functions which rely on the card metadata. Safe mode is activated
upon failure to sync properly. It is disabled once errors are resolved.

The reason for safe mode is to ensure that the bot stays online for admins to
be able to resync the bot in case there's an error without it crashing.

## Google Drive
Please see the Rclone documentation on how to setup a remote using Google
Drive. You will need to make an app password for this.

- scope: `drive.readonly`
- root\_folder\_id: The folder id where the cards are located, this can be found
  by looking at the url when viewing the folder in the browser in google drive.
