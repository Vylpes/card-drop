---
name: generate-test-plan
description: >-
  Generate manual test plans from Forgejo issues and publish them as markdown.
  Fetches the issue, analyzes requirements and linked context, builds a test-case
  table (Id, Description, Expected Results, Actual Results, Notes), and commits
  the file to the repo or posts it as an issue comment. Use when the user asks
  to generate a test plan, create test cases for a Forgejo/Gitea issue, or
  mentions issue numbers like #36 or git.vylpes.xyz issue URLs.
---

# Generate Test Plan

Generate a manual test plan from a Forgejo issue and publish it back to Forgejo.

## Inputs

The user supplies a Forgejo issue reference in any of these forms:

- Full URL: `https://git.vylpes.xyz/RabbitLabs/calculator/issues/36`
- Owner/repo + number: `RabbitLabs/calculator#36`
- Issue number only: `36` — resolve `owner`/`repo` from `git remote get-url origin`

## Workflow

Copy this checklist and track progress:

```
Task Progress:
- [ ] Step 1: Resolve issue reference
- [ ] Step 2: Fetch issue context
- [ ] Step 3: Analyze requirements
- [ ] Step 4: Draft test plan markdown
- [ ] Step 5: Publish to Forgejo
- [ ] Step 6: Report back to user
```

### Step 1: Resolve issue reference

Extract `owner`, `repo`, and `index` (issue number). If only a number is given, parse the git remote:

```bash
git remote get-url origin
# ssh://git@host:port/Owner/repo.git → owner=Owner, repo=repo
```

### Step 2: Fetch issue context

Use the **user-forgejo** MCP server:

1. `get_issue` — title, body, labels, milestone, linked PR
2. `list_issue_comments` — prior discussion and existing test plans
3. If body references other issues (`#17`, `Story: #17`), fetch those with `get_issue`
4. If `pull_request` is set, use `get_pull_request` and `get_pr_diff` for implementation context
5. If acceptance criteria exist on a parent story, derive test cases from them

Skip re-generating if a recent test-plan comment or `docs/test-plans/{index}-test-plan.md` already exists unless the user asks to regenerate.

### Step 3: Analyze requirements

From the issue and linked context, identify testable behaviors:

- **Defects** (`type/defect`): reproduce the bug, verify the fix, regression checks
- **Stories** (`type/story`): cover each acceptance criterion (GIVEN/WHEN/THEN)
- **Changes** (`type/change`): before/after behavior, edge cases
- **Investigations**: exploratory scenarios with clear pass/fail where possible

Each row must be independently executable by a human tester. Leave **Actual Results** and **Notes** empty.

### Step 4: Draft test plan markdown

Use this structure. Test IDs use `{ISSUE NUMBER}-{TEST NUMBER}` with a 4-digit zero-padded sequence (e.g. `36-0001`, `36-0002`).

```markdown
# Test Plan: #{index} — {issue title}

**Issue:** {html_url}
**Generated:** {YYYY-MM-DD}
**Milestone:** {milestone title or "—"}

## Summary

{One short paragraph: what is being tested and why.}

## Test Cases

| Id | Description | Expected Results | Actual Results | Notes |
|----|-------------|------------------|----------------|-------|
| {index}-0001 | {steps to perform} | {observable outcome} | | |
| {index}-0002 | {steps to perform} | {observable outcome} | | |
```

Rules:

- **Id**: `{issue-number}-{4-digit-seq}` starting at `0001`
- **Description**: concrete steps (command, UI action, input)
- **Expected Results**: observable, verifiable outcome
- **Actual Results**: always empty in generated plans
- **Notes**: always empty unless pre-existing context must be recorded (rare)

For examples, see [examples.md](examples.md).

### Step 5: Publish to Forgejo

Forgejo MCP has **no issue-attachment upload tool**. Use this order:

#### Option A — Commit markdown file (preferred)

1. Path: `docs/test-plans/{index}-test-plan.md`
2. Base64-encode the markdown content
3. `create_file` with:
   - `owner`, `repo`, `filepath`
   - `content` (base64)
   - `message`: `docs: add test plan for issue #{index}`
   - `branch`: default branch (`main` or `master` — check with `get_branch` or `list_branches`)
4. If the file already exists, use `update_file` instead (read current SHA via `get_file_contents` first)
5. `create_issue_comment` with a short summary and link to the committed file

#### Option B — Issue comment (fallback)

Use when:

- `create_file` / `update_file` fails (permissions, protected branch)
- User asks for comment-only delivery
- Repo commit is inappropriate for the context

Post the full markdown table via `create_issue_comment`. Body limit is 65536 characters; if exceeded, commit the file (Option A) or split across multiple comments.

Comment header:

```markdown
## Test Plan

Generated test plan for #{index}. Fill in **Actual Results** and **Notes** during testing.

{full markdown body}
```

### Step 6: Report back to user

Tell the user:

- Issue analyzed and number of test cases generated
- Where it was published (file path + commit, or comment URL)
- Any gaps or assumptions made during analysis

## MCP tool reference

| Action | Tool |
|--------|------|
| Fetch issue | `get_issue` |
| Fetch comments | `list_issue_comments` |
| Post comment | `create_issue_comment` |
| Commit file | `create_file` / `update_file` |
| Read existing file | `get_file_contents` |
| PR context | `get_pull_request`, `get_pr_diff` |

Always read tool schemas in the MCP descriptors before calling.

## Additional resources

- Example output: [examples.md](examples.md)
