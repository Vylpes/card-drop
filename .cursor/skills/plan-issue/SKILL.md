---
name: plan-issue
description: >-
  Advances a Forgejo issue one step through the planning cycle (needs/criteria →
  needs/estimate → needs/test → needs/approval). Explores the codebase, drafts
  the step outcome, raises question comments when blocked, and updates the issue
  after approval. Use when the user points at a needs/* ticket, asks to plan an
  issue, progress criteria/estimate/test, or run the planning runner manually.
---

# Plan Issue

Manual counterpart to the **Forgejo planning runner**. Progress **one** `needs/*` step on a user-specified issue. **No implementation, branches, or PRs.**

**Do not mutate Forgejo until the user approves the draft** (except posting a `question` comment when you must stop for answers — still show the questions in chat first).

## Inputs

Forgejo issue reference in any of:

- URL: `https://git.vylpes.xyz/External/card-drop/issues/553`
- `owner/repo#n`: `External/card-drop#553`
- Number only: `553` — resolve from `git remote get-url origin`

## Planning ladder

Only one `needs/*` label at a time (`exclusive`). Never skip ahead.

| Current | Work | On success | If unclear |
|---------|------|------------|------------|
| `needs/criteria` | Flesh out acceptance criteria in the issue body | → `needs/estimate` | Comment questions, add `question`, **stop** |
| `needs/estimate` | Set story points; justify briefly in chat | → `needs/test` | → back to `needs/criteria` |
| `needs/test` | Comment a QA test script vs the criteria | → `needs/approval` | → back to `needs/criteria` |
| `needs/approval` | **Stop.** Never remove this label | — | Human removes it when work may begin |

## Workflow

```
Task Progress:
- [ ] Step 1: Resolve issue reference
- [ ] Step 2: Fetch issue + detect needs/* step
- [ ] Step 3: Explore codebase (criteria / estimate / test)
- [ ] Step 4: Draft the step outcome
- [ ] Step 5: Present draft (and questions if any)
- [ ] Step 6: Apply on Forgejo after approval
- [ ] Step 7: Report back
```

### Step 1: Resolve issue reference

Extract `owner`, `repo`, `index`. From remote if needed:

```bash
git remote get-url origin
# ssh://git@host:port/Owner/repo.git → owner=Owner, repo=repo
```

### Step 2: Fetch issue + detect step

Use **user-forgejo**:

1. `get_issue` — title, body, labels, milestone
2. `list_issue_comments` — prior Q&A and test plans
3. Fetch linked issues (`Epic: #543`, etc.) when they inform criteria
4. Read `.forgejo/ISSUE_TEMPLATE.md` for body layout

If there is **no** `needs/*` label, stop and say this skill is for planning only (use `triage-issue` for idea/epic/investigation/spike/alert/incident).

If `question` is present and comments show unanswered agent questions, **stop** — wait for the human reply (or continue only if they answered in chat / comments).

### Step 3: Explore codebase

Ground the draft in this repo (Discord bot, cards, effects, webhooks, etc.):

- Search relevant commands, helpers, entities, tests, docs
- Note current behaviour criteria must describe accurately
- Flag unknowns that need the human

Keep an implementation sketch in chat only — do not post it unless asked.

### Step 4: Draft by step

#### `needs/criteria`

Replace placeholder criteria (`*No acceptance criteria*`, `*none*`, empty section) with testable content. Preserve Epic / Story Points / Subtasks / Notes and non-placeholder text.

**`type/story` (default):** GIVEN / WHEN / THEN blocks, one scenario each, blank line between:

```markdown
GIVEN I am a user
WHEN I run `/drop`
THEN I receive a card drop embed I can claim
```

**`type/change`:** fill Current / New Behaviour (and AC if useful).  
**`type/bug` / `type/defect`:** Reported / Expected Behaviour.  
Other types: closest match; default to GIVEN/WHEN/THEN.

See [examples.md](examples.md).

#### `needs/estimate`

Propose story points for the `Story Points:` field (Fibonacci-style: 1, 2, 3, 5, 8, …). Short rationale in chat from scope + codebase touch points. If criteria are too vague to estimate, draft a move **back** to `needs/criteria` instead.

#### `needs/test`

Draft an issue **comment** (not a repo commit) with a manual QA table derived from acceptance criteria:

```markdown
## Test Plan

| Id | Description | Expected Results | Actual Results | Notes |
|----|-------------|------------------|----------------|-------|
| {index}-0001 | {steps} | {observable outcome} | | |
```

Ids: `{issue}-{4-digit}` starting at `0001`. Leave Actual Results / Notes empty.

### Step 5: Present draft

Show:

1. **Current step** and **proposed next label** (or “stop for questions” / “already at needs/approval”)
2. **Draft** — body sections, estimate, or test-plan comment
3. **Questions** (if any) — numbered

Wait for approval (“looks good”, “apply”, “ship it”) or edits.

If questions block progress: after approval of the question text, `create_issue_comment`, `add_issue_labels` with `question`, and **do not** advance `needs/*`.

### Step 6: Apply (after approval)

Label helpers:

- Current `needs/*` id: from `get_issue.labels`
- Target id: from another issue with that label (`list_issues` + `labels` filter) or from labels already seen this session
- `needs/*` are exclusive — still `remove_issue_label` (old) then `add_issue_labels` (new) for clarity
- Known External org ids (verify if missing): `needs/criteria` 292, `needs/estimate` 293, `question` 322

Actions by step:

| Step | Mutate |
|------|--------|
| criteria → estimate | `edit_issue` full body; remove `needs/criteria`; add `needs/estimate`; remove `question` if present and resolved |
| estimate → test | `edit_issue` with Story Points filled; remove `needs/estimate`; add `needs/test` |
| estimate → criteria | remove `needs/estimate`; add `needs/criteria`; comment why |
| test → approval | `create_issue_comment` with test plan; remove `needs/test`; add `needs/approval` |
| test → criteria | remove `needs/test`; add `needs/criteria`; comment why |
| approval | no label changes |

`edit_issue` replaces the entire body — reconstruct fully.

Do not change title, assignees, milestone, or `type/*` unless asked.

### Step 7: Report back

- Issue URL
- What changed (body / comment / labels)
- Next step for the human (e.g. reply to questions, or remove `needs/approval` when ready to develop)

## MCP tools

| Action | Tool |
|--------|------|
| Fetch issue | `get_issue` |
| Comments | `list_issue_comments`, `create_issue_comment` |
| Update body | `edit_issue` |
| Labels | `add_issue_labels`, `remove_issue_label` |
| Find label ids | `list_issues` with `labels` filter |

Read MCP tool schemas before calling.

## Additional resources

- Examples: [examples.md](examples.md)
- Template: `.forgejo/ISSUE_TEMPLATE.md`
