# Vendored `braces@3.0.4`

Temporary security backport of [micromatch/braces#72](https://github.com/micromatch/braces/pull/72) for [CVE-2026-93687](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) / [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm).

Upstream has not published a patched release yet (latest npm is `3.0.3`). This package is the community fix from `FSDevelop/braces` (`fix/limit-nesting-depth`), versioned as `3.0.4` so `yarn audit` treats it as outside the advisory range.

Remove this vendor directory and the `braces` resolution in `package.json` once an official `braces >= 3.0.4` (or equivalent) is published on npm.
