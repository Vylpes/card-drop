---
name: generate-criteria
description: >-
  Expands brief Forgejo issues into detailed acceptance criteria by reading the
  title and description, exploring the codebase to plan the change, asking the
  user for clarifications, and updating the issue body via edit_issue. Use when
  the user asks to generate criteria, flesh out an issue, write acceptance
  criteria, or mentions issues with needs/criteria or bare story/change titles.
---

# Generate Criteria

Turn a brief Forgejo issue into structured, testable criteria. **Do not edit the issue until the user approves the draft.**

## Inputs

The user supplies a Forgejo issue reference in any of these forms:

- Full URL: `https://git.vylpes.xyz/RabbitLabs/calculator/issues/30`
- Owner/repo + number: `RabbitLabs/calculator#30`
- Issue number only: `30` — resolve `owner`/`repo` from `git remote get-url origin`

## Workflow

Copy this checklist and track progress:

```
Task Progress:
- [ ] Step 1: Resolve issue reference
- [ ] Step 2: Fetch issue context
- [ ] Step 3: Explore codebase and plan the change
- [ ] Step 4: Draft criteria
- [ ] Step 5: Present draft and ask clarifications
- [ ] Step 6: Update issue on Forgejo (after user approval)
- [ ] Step 7: Report back to user
```

### Step 1: Resolve issue reference

Extract `owner`, `repo`, and `index` (issue number). If only a number is given, parse the git remote:

```bash
git remote get-url origin
# ssh://git@host:port/Owner/repo.git → owner=Owner, repo=repo
```

### Step 2: Fetch issue context

Use the **user-forgejo** MCP server:

1. `get_issue` — title, body, labels, milestone
2. `list_issue_comments` — prior discussion and decisions
3. If body references other issues (`#17`, `Epic: #16`, `Story: #17`), fetch those with `get_issue`
4. Read `.forgejo/ISSUE_TEMPLATE/*.md` to match the expected section layout for this issue type

Skip re-generating if the issue already has complete criteria unless the user asks to regenerate or refine.

**Complete criteria** means placeholder sections (`*none*`, `*no description*`, empty `## Acceptance Criteria`) are replaced with concrete, testable content.

### Step 3: Explore codebase and plan the change

Before writing criteria, understand how the change would be implemented:

- Search for relevant modules, commands, config, and tests
- Note current behaviour that criteria must reference accurately
- Identify touch points (files, CLI flags, GUI surfaces, APIs)
- Flag unknowns that need user input

Summarize the implementation plan in plain language (not code). This plan informs the criteria but is **not** posted to the issue unless the user asks.

### Step 4: Draft criteria

Choose the format from the issue's `type/*` label (fall back to body structure if labels are missing).

#### `type/story` — Acceptance Criteria

Use GIVEN / WHEN / THEN blocks. Each criterion must be independently verifiable.

```markdown
GIVEN I am a user
WHEN I run `calculator` without any parameters
THEN the GUI will launch by default
```

Rules:

- One scenario per GIVEN/WHEN/THEN triplet; blank line between scenarios
- Use concrete commands, inputs, and observable outcomes
- Cover happy path, relevant edge cases, and error cases
- Convert bullet hints in the brief (e.g. `- [ ] Save expression to a variable`) into full scenarios

Preserve the story template sections: Epic, Story Points/Estimate, description, Subtasks, Notes. Only replace placeholder content in unfilled sections.

#### `type/change` — Current Behaviour / New Behaviour

```markdown
## Current Behaviour

{What the app does today, grounded in codebase findings}

## New Behaviour

{Desired behaviour after the change, specific and testable}
```

Add GIVEN/WHEN/THEN scenarios under `## Acceptance Criteria` when the change needs testable checkpoints.

#### `type/bug` / `type/defect` — Reported / Expected Behaviour

```markdown
## Reported Behaviour

{Steps to reproduce and what actually happens}

## Expected Behaviour

{What should happen instead}
```

Derive from the brief, screenshots, and linked parent story criteria when present.

#### `type/investigation`

```markdown
## Questions

{Open questions to answer}

## Success Criteria

{Observable outcomes that close the investigation}
```

#### Other types

Use the closest matching template. When unsure, default to GIVEN/WHEN/THEN acceptance criteria.

For examples, see [examples.md](examples.md).

### Step 5: Present draft and ask clarifications

**Stop here.** Show the user:

1. **Implementation plan** — short summary of how you would build the change
2. **Proposed issue body** — full markdown (or the sections being added/changed)
3. **Clarifications** — numbered questions for anything ambiguous (scope, defaults, error handling, UX, backwards compatibility)

Use `AskQuestion` when available; otherwise ask conversationally. Group related questions.

Wait for the user to approve, answer questions, or request edits. Revise the draft until they confirm.

**Never call `edit_issue` before explicit approval** (e.g. "looks good", "update the issue", "ship it").

### Step 6: Update issue on Forgejo (after user approval)

`edit_issue` replaces the entire body — reconstruct the full body, preserving non-placeholder content (epic links, subtasks, images, attachments references, notes the user wants kept).

1. `edit_issue` with `owner`, `repo`, `index`, and the final `body`
2. If the issue has the `needs/criteria` label, remove it with `remove_issue_label` (label id from `get_issue` or `list_labels`)

Do not change `title`, `state`, `milestone`, or `assignees` unless the user asked.

### Step 7: Report back to user

Tell the user:

- Issue URL and what sections were updated
- Whether `needs/criteria` was removed
- Any assumptions baked into the final criteria
- Suggested next step (e.g. generate a test plan with the `generate-test-plan` skill)

## MCP tool reference

| Action | Tool |
|--------|------|
| Fetch issue | `get_issue` |
| Fetch comments | `list_issue_comments` |
| Update issue | `edit_issue` |
| Remove label | `remove_issue_label` |
| List labels | `list_labels` |

Always read tool schemas in the MCP descriptors before calling.

## Additional resources

- Example output: [examples.md](examples.md)
- Issue templates: `.forgejo/ISSUE_TEMPLATE/`
