# Development

This document describes how the bot wires up its interaction handlers, so that
adding a new one does not mean guessing where the registration lives. See the
[README](../README.md) for build, test, lint and migration commands.

## Registration

Everything the bot responds to is registered in one place, `src/registry.ts`.
`src/bot.ts` calls the three registry methods on startup, before the client
logs in. Nothing is discovered from the file system, so a handler that is not
listed in the registry does not exist as far as the bot is concerned.

| What | Registry method | Handler location | Base class |
| --- | --- | --- | --- |
| Slash command | `Registry.RegisterCommands` | `src/commands/` | `Command` (`src/type/command.ts`) |
| Button | `Registry.RegisterButtonEvents` | `src/buttonEvents/` | `ButtonEvent` (`src/type/buttonEvent.ts`) |
| String dropdown | `Registry.RegisterStringDropdownEvents` | `src/stringDropdowns/` | `StringDropdownEvent` (`src/type/stringDropdownEvent.ts`) |

Each registration takes the id first and an instance of the handler second:

```ts
CoreClient.RegisterCommand("inventory", new Inventory());
CoreClient.RegisterButtonEvent("inventory", new InventoryButtonEvent());
CoreClient.RegisterStringDropdownEvent("inventory", new InventoryStringDropdown());
```

All three accept an optional `Environment` as the last argument, defaulting to
`Environment.All`. Passing `Environment.Test` keeps a handler out of
production, which is how the `stage/*` commands are limited:

```ts
CoreClient.RegisterCommand("dropnumber", new Dropnumber(), Environment.Test);
```

The environment is checked at registration time against `BOT_ENV`, so a
handler that does not apply to the running environment is never added to the
list at all rather than being skipped later.

`RegisterCommand` also accepts a `serverId` after the environment to restrict a
command to a single guild. The command dispatcher prefers a guild-specific
registration over a global one with the same name.

## Dispatch

Incoming interactions are routed by the dispatchers in
`src/client/interactionCreate/`:

- `ChatInputCommand.ts` matches on the command name.
- `Button.ts` and `StringDropdown.ts` match on the **first space-separated
  segment** of the custom id, so a button with the custom id
  `inventory 1234 2` is handled by the event registered as `inventory`. The
  rest of the string is the handler's own to parse, and by convention carries
  the user id and page number.

Each dispatcher looks the id up in the registered list and calls the handler's
`execute` method inside a `try/catch` that logs the failure and replies with a
generic error message. When no handler matches the id, the user is told the
command or event was not found.

Be aware that on this branch the dispatchers do not `await` `execute`, so only
a synchronous throw reaches that `try/catch`; a rejected promise from an
`async` handler escapes as an unhandled rejection.
[#512](https://git.vylpes.xyz/External/card-drop/pulls/512) adds the `await`
and the error-reply handling that goes with it. Until then, a handler should
catch its own failures and reply to the user itself, which is what the existing
handlers do.

## Adding a handler

1. Add the class under the relevant directory, extending the base class for
   that kind of interaction and overriding `execute`.
2. Register it in `src/registry.ts` with the id the interaction will use.
3. For buttons and dropdowns, make sure whatever builds the component sets a
   custom id whose first segment matches the registered id.
4. Add a test suite (see below).

## Test expectations

Tests live in `tests/`, mirroring the `src/` layout, and are named
`<Handler>.test.ts`. Test names follow a `GIVEN ... EXPECT ...` convention.

Dependencies are replaced with `jest.mock` at module level, and interactions
are faked rather than constructed: `tests/__functions__/discord.js/` has
generators for button and chat-input interactions, and suites for kinds that
have no generator yet build a small local mock factory instead.

A change to an interaction handler should come with assertions that the
handler was reached with the parsed arguments it expects, and that its failure
paths still reply to the user. Anything touching the areas covered by
[docs/cards.md](cards.md), [docs/google-drive-sync.md](google-drive-sync.md) or
[docs/logger.md](logger.md) should also cover the configuration those documents
describe, since a missing or malformed environment variable is the most common
way those areas break.
