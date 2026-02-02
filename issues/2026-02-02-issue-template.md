## Issue Title: Fix CI failure: oxc-parser native binding error in postinstall script

The CI build is failing during the `npm install` postinstall step when running `nuxt prepare`. The error occurs in the `oxc-parser` package which cannot find its native bindings.

## Error Details

**Failing Job:** https://github.com/ThomasTirole/klap/actions/runs/21590890942/job/62210475095

**Error Message:**
```
[error] Cannot find native binding. npm has a bug related to optional dependencies (https://github.com/npm/cli/issues/4828). Please try `npm i` again after removing both package-lock.json and node_modules directory.
  at node_modules/oxc-parser/src-js/bindings.js:575:11
```

**Command that failed:** `nuxt prepare` (during postinstall)

**Commit:** b668a9b96662009b91b507a4e746c18ac53c4fda

## Expected Behavior

The CI workflow should successfully install dependencies and complete the postinstall script without errors.

## Possible Solutions

1. Update the CI workflow to clear `node_modules` and `package-lock.json` before installing dependencies
2. Configure npm to handle optional dependencies properly in the CI environment
3. Pin or update the `oxc-parser` dependency version
4. Add a workaround in the workflow to handle the known npm bug with optional dependencies
5. Consider using a different package manager (pnpm or yarn) that handles optional dependencies more reliably

## Date Created
2026-02-02 12:58:03