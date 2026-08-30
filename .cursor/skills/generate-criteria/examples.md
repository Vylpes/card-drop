# Criteria Examples

## Example: story #30 — pipe stdin to non-interactive CLI

**Brief title:** Ability to pipe stdin to the non-interactive cli mode  
**Brief body:** *(empty)*  
**Labels:** `type/story`, `needs/criteria`

### Implementation plan (shown to user, not posted)

- Non-interactive mode likely lives in the CLI entrypoint; check how `calculator cli` vs one-shot evaluation works today
- Stdin piping probably means reading expressions line-by-line or as a single expression when not a TTY
- Touch points: CLI argument parsing, interactive vs batch mode detection, error output on malformed input

### Clarifications to ask

1. Should piped input be one expression per line, or a single expression for the whole stream?
2. Should `calculator cli` still be interactive when attached to a TTY, and only batch-read when stdin is piped?
3. What exit code on evaluation errors (non-zero)?

### Proposed issue body

```markdown
Epic: \
Story Points:

---

Allow users to pipe expressions into the calculator for scripting and automation without starting an interactive session.

## Acceptance Criteria

GIVEN I have piped a valid expression to stdin
WHEN I run `calculator` with stdin not attached to a TTY
THEN the expression is evaluated and the result is printed to stdout

GIVEN I have piped multiple lines of valid expressions to stdin
WHEN I run `calculator` with stdin not attached to a TTY
THEN each line is evaluated in order and each result is printed on its own line

GIVEN I have piped invalid input to stdin
WHEN I run `calculator` with stdin not attached to a TTY
THEN a clear error message is printed to stderr and the process exits with a non-zero status

GIVEN I run `calculator cli` with stdin attached to a TTY
WHEN I have not piped any input
THEN the interactive CLI session starts as today

## Subtasks

*none*

## Notes

*none*
```

---

## Example: change #32 — BIDMAS option

**Brief title:** Make an option to follow BIDMAS rules  
**Brief body:** Do we follow BIDMAS?

### Proposed sections

```markdown
Do we follow BIDMAS?

## Current Behaviour

Expressions are evaluated left-to-right without standard operator precedence (BIDMAS/BODMAS).

## New Behaviour

Users can enable BIDMAS precedence so multiplication/division are evaluated before addition/subtraction, and indices before multiplication.

## Acceptance Criteria

GIVEN BIDMAS mode is disabled (default)
WHEN I evaluate `2+3*4`
THEN the result is `20` (left-to-right)

GIVEN BIDMAS mode is enabled
WHEN I evaluate `2+3*4`
THEN the result is `14`

GIVEN BIDMAS mode is enabled
WHEN I evaluate `2^3*2`
THEN indices are applied before multiplication
```

---

## Example: defect #36 — GUI launch failure

**Brief title:** Running `calculator gui` fails with "This application can not open files"  
**Parent story #17** already defines acceptance criteria for GUI/CLI launch.

### Proposed sections

```markdown
Story: #17

---

Running just `calculator` works though

![image](/attachments/48a610a0-001a-441a-9dc8-96a5186d815f)

## Reported Behaviour

GIVEN the calculator is installed
WHEN I run `calculator gui`
THEN an error dialog appears: "This application can not open files"

GIVEN the calculator is installed
WHEN I run `calculator` with no arguments
THEN the GUI launches successfully

## Expected Behaviour

GIVEN the calculator is installed
WHEN I run `calculator gui`
THEN the GUI launches successfully with no error dialog

GIVEN the calculator is installed
WHEN I run `calculator cli`
THEN the CLI launches and no GUI window appears
```
