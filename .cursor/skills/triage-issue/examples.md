# Triage Issue Examples

## Example: epic #543 — Web Management UI

Already broken into stories #544–#553. A triage pass should:

1. Confirm task list coverage vs decision #542
2. Propose only **missing** follow-ons (e.g. future non-admin roles) as new `type/story` + `needs/criteria`, unassigned
3. Comment on #543 with the proposal; create tickets only after approval
4. Link new `#n` into the epic task list if the user wants that

Do **not** re-create #544–#553.

---

## Example: idea → epic + stories

**Parent:** `type/idea` “Seasonal event drops”

### Proposal (chat)

**Questions**

1. Fixed calendar window or admin-triggered?
2. New rarity only, or new series + cards?

**Proposed tickets**

| Title | Type | Notes |
|-------|------|-------|
| Seasonal event drops | `type/epic` | Parent epic once idea accepted |
| Event config + window | `type/story` | `needs/criteria`, unassigned, Epic: new epic |
| Event-weighted drop table | `type/story` | same |

Create **only after** the human accepts (ideas do not auto-spawn tickets).

---

## Example: investigation

**Parent:** `type/investigation` “Can binder slots block sacrifice?”

### Findings comment

- Trace `Sacrifice` button/command and inventory availability helpers
- State whether binder-placed instances are already excluded
- Recommend a `type/story` or `type/change` only if a gap exists

### Follow-on (if gap)

Create `type/story` + `needs/criteria`, unassigned, with Epic/Notes linking the investigation.

---

## Example: incident

**Parent:** `type/incident` “Safe mode activated due to resync”

Comment analysis (likely bad card metadata / sync failure). Do not open implementation PRs unless asked. Optionally propose a small `type/change` / `type/defect` with `needs/criteria` if a durable fix is wanted.
