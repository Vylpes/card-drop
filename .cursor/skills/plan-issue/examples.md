# Plan Issue Examples

## Example: `needs/criteria` on story #553

**Title:** Docs: management UI deploy and OAuth  
**Labels:** `type/story`, `needs/criteria`  
**Brief:** SO THAT operators know how to expose the management UI… placeholders in AC.

### Draft criteria (body section)

```markdown
## Acceptance Criteria

GIVEN I am an operator reading the docs
WHEN I follow the management UI deploy section
THEN I know how to expose the UI behind HTTPS / a reverse proxy and which ports or paths to publish

GIVEN Discord OAuth is required for the management UI
WHEN I read the OAuth configuration section
THEN I know which env vars to set and that only `BOT_ADMINS` may sign in in v1

GIVEN Google Drive sync may still run
WHEN I read the coexistence notes
THEN I understand that the UI edits `$DATA_DIR/cards` and Drive sync remains an optional ops path
```

### On approval

- `edit_issue` with full reconstructed body  
- Remove `needs/criteria` → add `needs/estimate`

---

## Example: blocked on questions

Unknowns while drafting criteria → present questions in chat, then after approval of the question comment:

```markdown
## Questions

1. Should BookStack be updated in the same change as repo `docs/`, or is repo-only enough for this story?
2. Is reverse-proxy config in scope, or only application env/docs?
```

Add `question`, **do not** advance to `needs/estimate`.

---

## Example: `needs/estimate`

Criteria solid; touch points are docs + maybe BookStack. Propose **2** points, set `Story Points: 2`, move to `needs/test`.

---

## Example: `needs/test` comment

```markdown
## Test Plan

| Id | Description | Expected Results | Actual Results | Notes |
|----|-------------|------------------|----------------|-------|
| 553-0001 | Open the management UI deploy docs | Steps cover reverse proxy / HTTPS expectations | | |
| 553-0002 | Open the OAuth env section | Required env vars and `BOT_ADMINS` rule are documented | | |
| 553-0003 | Open coexistence / Drive notes | UI vs Drive sync roles are clear | | |
```

On approval: post comment, move `needs/test` → `needs/approval`.
