---
name: Use git-commit-helper skill for commit messages
description: Always invoke the git-commit-helper skill when the user asks for a commit message
type: feedback
---

When the user asks for a commit message (e.g. "give me a commit message", "help me write a commit message", "what should my commit message be"), invoke the `git-commit-helper` skill via the Skill tool before responding.

**Why:** User explicitly requested this on 2026-05-05 — they want the skill's conventional-commit format and analysis workflow applied consistently.

**How to apply:** Any time the user asks for help with a commit message for current or staged changes, call `Skill({ skill: "git-commit-helper" })` first.
