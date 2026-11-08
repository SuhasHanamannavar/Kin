# Contributing & Git Commit Guidelines

Welcome to Kin! We appreciate contributions from the community. To keep our repository clean, searchable, consistent, and maintainable for everyone, we adhere to strict Git commit conventions based on the **Conventional Commits** specification.

---

## When to Make Commits

Make a commit when you have completed a **logical, self-contained change**. A good commit represents one distinct unit of work:

* A new feature
* A bug fix
* A refactor
* A documentation change
* A test suite improvement
* A performance optimization
* A dependency or build change
* A configuration update

### Good Workflow

```text
Implemented feature logic
        ↓
     COMMIT

Fixed edge-case redirection bug
        ↓
     COMMIT

Added unit tests for feature
        ↓
     COMMIT
```

### Avoid Micro-Commits & Giant Commits

- **Avoid committing too often**: Group related changes rather than committing every minor typo or variable tweak (`❌ fixed typo`, `❌ changed variable again` → `✅ refactor(auth): simplify state handling`).
- **Avoid giant unrelated commits**: Do not lump unrelated features, navbar updates, bugfixes, and documentation rewrites into one massive commit. Keep them separated.

---

## Commit Message Structure

Commits follow the **Conventional Commits** format:

```text
<type>[optional scope]: <description>

[optional body]

[optional footer]
```

### Example

```text
feat(watchlist): add custom CSS selector filters

Allow users to specify targeted CSS selectors when monitoring
dynamic DOM nodes, reducing change detection noise.

Closes #14
```

---

## 1. Subject / Description Rules

* Keep the subject line under **50 characters** where possible.
* Use lowercase when using Conventional Commits.
* Do not end the subject with a period.
* Use the **imperative mood** (e.g., *"add user watchlist"* instead of *"added user watchlist"* or *"adding user watchlist"*).
* Answer the prompt: *"If applied, this commit will..."*

---

## 2. Commit Types

| Type | Description | Example |
|---|---|---|
| `feat` | Adding a new feature | `feat(api): add export signals as JSON` |
| `fix` | Fixing a bug | `fix(auth): prevent unauthorized redirect loop` |
| `refactor` | Code restructuring without altering behavior | `refactor(db): streamline DynamoDB query helpers` |
| `docs` | Documentation updates only | `docs: update deployment and env guide` |
| `test` | Adding or modifying tests | `test(watchlist): add URL validator unit tests` |
| `style` | Code style/formatting (whitespace, semicolons) | `style: format imports with prettier` |
| `perf` | Performance optimizations | `perf(scraper): reduce DOM diff computation time` |
| `build` | Changes to build system or dependencies | `build: update Next.js to 14.2.5` |
| `ci` | CI/CD configuration files and scripts | `ci: add GitHub Actions workflow for linting` |
| `chore` | Maintenance tasks not modifying src or test files | `chore: clean up unused dependencies` |
| `revert` | Reverting a previous commit | `revert: revert "feat: experimental cache"` |

---

## 3. Scopes

Scopes indicate the subsystem affected:

* `feat(auth): ...`
* `fix(watchlist): ...`
* `docs(readme): ...`
* `refactor(db): ...`
* `perf(scraper): ...`
* `chore(deps): ...`

---

## 4. Commit Body & Footers

For non-trivial changes, write a body explaining **what** changed and **why**:

```text
fix(signals): handle empty DOM diffs gracefully

When a monitored page changes only whitespace or non-rendered
metadata, the change ratio previously triggered an empty signal.
Filter these out so users receive alerts only for meaningful content changes.
```

### Breaking Changes

Always highlight breaking changes prominently:

```text
feat(api): change signals response payload format

BREAKING CHANGE: client applications must access signals via
`response.data.signals` instead of `response.signals`.
```

---

## Pre-Commit Checklist

Before running `git commit`, verify:

- [ ] Does this commit represent one logical, self-contained change?
- [ ] Is the subject line written in the imperative mood and under 50 characters?
- [ ] Is the correct commit type (`feat`, `fix`, `docs`, etc.) and scope used?
- [ ] Have you tested the changes locally (`npm run type-check`, `npm run build`)?
- [ ] Are secrets, API keys, and environment files (`.env*`) strictly excluded?
- [ ] Did you review `git diff --staged` before finalizing?

---

Thank you for helping keep the Kin codebase clean and maintainable! 🐧
