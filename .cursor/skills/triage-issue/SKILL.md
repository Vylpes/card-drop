---
name: triage-issue
description: >-
  Triages Forgejo idea, epic, investigation, spike, alert, or incident issues:
  explores the codebase, asks clarifying questions, proposes follow-on epics or
  stories, and creates unassigned needs/criteria tickets after approval. Use when
  the user points at a triage-type ticket, asks to break down an epic/idea, spawn
  stories, or run the triage runner manually.
---

# Triage Issue

Manual counterpart to the **Forgejo triage runner**. Work a user-specified triage issue: clarify, propose structure, and optionally create follow-on tickets. **No implementation PRs.**

**Do not create or edit issues until the user approves the proposal.**

## Inputs

Forgejo issue reference in any of:

- URL: `https://git.vylpes.xyz/External/card-drop/issues/543`
- `owner/repo#n`: `External/card-drop#543`
- Number only: `543` — resolve from `git remote get-url origin`

## In scope

Only when the issue has one of:

| Label | Behaviour |
|-------|-----------|
| `type/idea` | No code. Clarify uncertainties; propose epics/stories. Create only after human accepts |
| `type/epic` | No direct implementation. Break into stories (and sub-epics if needed) |
| `type/investigation` | Explore codebase; comment findings; propose follow-on stories when useful |
| `type/spike` | Same as investigation; no estimate required |
| `type/alert` / `type/incident` | Comment helpful analysis only unless the human asks for code or new tickets |

**Skip / redirect:**

- Any `needs/*` → use `plan-issue` instead
- `type/admin` → ignore (time logging)
- `type/bug`, `type/defect`, `type/dependencies`, `type/story`, `type/change` → out of scope for this skill (development runner / normal coding)

## Workflow

```
Task Progress:
- [ ] Step 1: Resolve issue reference
- [ ] Step 2: Fetch issue + confirm triage type
- [ ] Step 3: Explore codebase / gather context
- [ ] Step 4: Draft proposal (questions, findings, child tickets)
- [ ] Step 5: Present proposal and wait for approval
- [ ] Step 6: Apply on Forgejo after approval
- [ ] Step 7: Report back
```

### Step 1: Resolve issue reference

Extract `owner`, `repo`, `index` (from URL, `owner/repo#n`, or `git remote get-url origin`).

### Step 2: Fetch + confirm type

Use **user-forgejo**:

1. `get_issue`
2. `list_issue_comments`
3. Fetch already-linked children (`#544`, task lists) so you do not duplicate them

If `needs/*` present → stop, suggest `plan-issue`.  
If not a triage `type/*` → stop with a short explanation.

### Step 3: Explore

- Search the repo for the feature area (commands, entities, webhooks, docs)
- For alerts/incidents: prefer logs/docs/recent related issues over speculative fixes
- Note gaps, risks, and natural story boundaries

### Step 4: Draft proposal

Always prepare a chat proposal with:

1. **Summary** — what you understood
2. **Questions** (if any) — numbered; blocking vs nice-to-have
3. **Findings** (investigation/spike/alert/incident) — concrete, evidence-backed
4. **Proposed tickets** (idea/epic/investigation/spike when spawning work):

For each child:

- Title
- Recommended `type/*` (`type/story`, `type/epic`, …)
- Short body (use template below)
- Milestone: inherit parent milestone when present unless user says otherwise
- Labels: `needs/criteria` + the `type/*` — **leave unassigned**

Story body skeleton (match `.forgejo/ISSUE_TEMPLATE.md`):

```markdown
Epic: #{parent}
Story Points:

---

{one-paragraph intent / SO THAT …}

## Acceptance Criteria

*No acceptance criteria*

## Subtasks

*none*

## Notes

{links to parent, decisions, docs}
```

Epic children may use a richer summary + task list (see #543 style) instead of the story skeleton.

See [examples.md](examples.md).

### Step 5: Present and wait

Show the full proposal. Ask what to create (all / subset / none).  
If only questions: after approval of question text, comment on the parent and add `question` — do not create children yet.

### Step 6: Apply (after approval)

1. `create_issue_comment` on the parent with findings / plan / links as appropriate
2. For each approved child: `create_issue` with title, body, labels (`needs/criteria` + type), milestone; **no assignees**
3. Optionally update the parent body task list with new `#n` links (`edit_issue`) when that matches existing epic style
4. Resolve label ids from `get_issue.labels` on examples or `list_issues` + `labels` filter  
   Known External ids: `needs/criteria` 292, `type/story` 304, `type/epic` 300, `type/idea` 301, `question` 322

Do not merge, branch, or implement.

### Step 7: Report back

- Parent URL
- Comment URL if posted
- New issue URLs
- Reminder: children stay unassigned with `needs/criteria` until someone assigns them for `plan-issue`

## MCP tools

| Action | Tool |
|--------|------|
| Fetch | `get_issue`, `list_issue_comments` |
| Comment | `create_issue_comment` |
| Create | `create_issue` |
| Edit parent | `edit_issue` |
| Labels | `add_issue_labels`, `remove_issue_label` |

Read MCP tool schemas before calling.

## Additional resources

- Examples: [examples.md](examples.md)
- Template: `.forgejo/ISSUE_TEMPLATE.md`
- Planning follow-up: `.cursor/skills/plan-issue/SKILL.md`
