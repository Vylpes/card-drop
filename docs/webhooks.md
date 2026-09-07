# Webhooks

The bot exposes a small HTTP API alongside the Discord client, served by
Express from `src/webhooks.ts`. It listens on the port given by
`EXPRESS_PORT`, which is configured in `.env` (see `.env.example`).

## Authentication

Every endpoint is protected by a shared secret. Set `WEBHOOK_TOKEN` in `.env`
to a long random string and send it on each request in the `x-webhook-token`
header.

- If the header is missing or does not match, the request is rejected with
  `401` and the attempt is logged as a warning.
- If `WEBHOOK_TOKEN` is not configured at all, the API refuses every request
  with `503` and logs an error. This is deliberate: an unauthenticated endpoint
  that reloads the card database should not be reachable by accident.

The comparison is length-checked and then timing safe, so it does not leak the
token through response timing.

## Endpoints

### `POST /api/reload-db`

Rereads the card metadata from `$DATA_DIR/cards` and reloads it into the bot.
This is the same reload that runs on startup and after a Google Drive sync, and
is useful when cards have been changed on disk without restarting the bot.

```bash
curl -X POST \
  -H "x-webhook-token: $WEBHOOK_TOKEN" \
  http://localhost:3302/api/reload-db
```

Responses:

| Status | Meaning                                      |
| ------ | -------------------------------------------- |
| `200`  | The card database was reloaded.              |
| `401`  | The `x-webhook-token` header was wrong.      |
| `503`  | `WEBHOOK_TOKEN` is not configured on the bot.|

## Tests

The middleware and the handler are covered by
`tests/hooks/middleware/RequireWebhookToken.test.ts` and
`tests/hooks/ReloadDB.test.ts`. New endpoints are expected to come with
equivalent coverage.
