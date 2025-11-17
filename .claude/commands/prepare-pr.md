---
description: Analyze uncommitted changes and create branch + commit plan + PR description
---

Analyze my uncommitted changes and create a structured plan for branch creation, commits, and PR description.

**Requirements:**
1. Run `git status` and `git diff` to see all changes
2. Read key files to understand what feature/changes were implemented
3. Group changed files logically into commits (~5-15 files per commit based on related functionality)
4. Generate two markdown files:

**File 1: `branch-and-commits.md`**
- Create an appropriate branch name based on the feature (following conventional branch naming: feat/, fix/, refactor/, chore/)
- Provide sequential git commands for:
  - Branch creation
  - Each commit with `git add` commands for specific files
  - All commits must use `HUSKY=0` prefix to skip Husky hooks
  - Commit messages following conventional commits format (feat/fix/refactor/chore/docs/test)
  - Each commit message should have a title and bullet points explaining the changes
  - Push command
  - Optional: gh pr create command

**File 2: `pr-description.md`**
- Follow the structure from `@.github/pull_request_template.md`
- Include comprehensive "How to Test" section with specific test scenarios
- Fill out all sections: Description, Type of change, Quality check, etc.
- Leave placeholders for: Figma links, Related issues, Jira tickets, Screenshots

**Important:**
- DO NOT execute any git commands - only provide the markdown files
- Analyze the actual changes to write accurate descriptions
- Group commits by logical feature areas, not just file count
- Make commit messages descriptive and explain the "why" not just the "what"
- Ensure the PR description includes detailed testing instructions for all changes

After creating both files, provide a brief summary of:
- Branch name chosen
- Number of commits created
- Main feature/changes being introduced
