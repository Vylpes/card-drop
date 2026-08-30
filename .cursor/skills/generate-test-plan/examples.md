# Test Plan Examples

## Example: defect issue #36

**Issue:** Running `calculator gui` fails with "This application can not open files"
**Parent story #17 acceptance criteria:** GUI launches for `calculator`, `calculator gui`; CLI launches for `calculator cli`

```markdown
# Test Plan: #36 — Running `calculator gui` fails with "This application can not open files"

**Issue:** https://git.vylpes.xyz/RabbitLabs/calculator/issues/36
**Generated:** 2026-06-29
**Milestone:** 0.1.0

## Summary

Verify GUI mode launches correctly via both default and explicit `gui` subcommand, and that the defect reported in #36 is fixed without breaking CLI mode.

## Test Cases

| Id | Description | Expected Results | Actual Results | Notes |
|----|-------------|------------------|----------------|-------|
| 36-0001 | Run `calculator` with no arguments | GUI window opens; no error dialog | | |
| 36-0002 | Run `calculator gui` | GUI window opens; no "This application can not open files" error | | |
| 36-0003 | Run `calculator cli` | Interactive CLI session starts; no GUI window | | |
| 36-0004 | Run `calculator gui` twice in succession | Both invocations open GUI without error | | Regression |
| 36-0005 | Run `calculator --help` | Help text displays; no GUI launch | | |
```

## Example: story with acceptance criteria

For a story with GIVEN/WHEN/THEN blocks, map each criterion to at least one test row. Add negative and edge-case rows where relevant.

| Id | Description | Expected Results | Actual Results | Notes |
|----|-------------|------------------|----------------|-------|
| 17-0001 | Run `calculator` with no parameters | GUI launches by default | | From AC |
| 17-0002 | Run `calculator gui` | GUI launches | | From AC |
| 17-0003 | Run `calculator cli` | CLI launches | | From AC |
| 17-0004 | Run `calculator invalid` | Clear error message; neither GUI nor CLI starts unexpectedly | | Edge case |
