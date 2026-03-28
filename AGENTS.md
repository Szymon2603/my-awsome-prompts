# AGENTS.md

## Gitflow

### Branch Protection
- `main` is the protected branch - NEVER commit directly to main
- All changes go through feature branches

### Workflow
1. Create a feature branch from main: `git checkout -b feature/your-feature`
2. Make changes and commit
3. Push branch: `git push -u origin feature/your-feature`
4. Create pull request (PR) when ready
5. After PR approval, squash and merge to main
6. Delete feature branch after merge

### Commit Messages
- Use conventional commits: `type(scope): description`
- Types: feat, fix, docs, refactor, test, chore
- Keep commits atomic and focused

### Branch Naming
- `feature/` - new features
- `fix/` - bug fixes
- `hotfix/` - urgent production fixes
- `refactor/` - code refactoring

### Git Identity
Before committing, set local git identity to model name:
- Set `user.name` to the model name (e.g., "big-pickle")
- Set `user.email` to model name @opencode.com (e.g., "big-pickle@opencode.com")
- Apply to local repo only (not global)

---

## GitHub CLI (gh)

### Push changes to remote
```bash
git push -u origin feature/your-feature
```

### Create Pull Request
```bash
# Interactive (prompts for title/body)
gh pr create

# With title and body
gh pr create --title "feat: add new feature" --body "Description..."

# Fill from commits
gh pr create --fill

# With reviewers
gh pr create --reviewer username,org/team-name

# Draft PR
gh pr create --draft

# Dry-run (preview without creating)
gh pr create --dry-run
```

### Checkout PR locally
```bash
# Interactive select
gh pr checkout

# By number or URL
gh pr checkout 123
gh pr checkout https://github.com/OWNER/REPO/pull/123

# By branch name
gh pr checkout feature-branch
```

### Sync latest from remote
```bash
# Sync local from remote parent
gh repo sync

# Sync specific branch
gh repo sync --branch main

# Force sync (hard reset)
gh repo sync --force
```

### Create Issue
```bash
# Interactive
gh issue create

# With title and body
gh issue create --title "Bug: something is broken" --body "Steps to reproduce..."

# With labels
gh issue create --label bug --label "help wanted"

# Assign to self
gh issue create --assignee "@me"

# Add to project
gh issue create --project "Roadmap"
```

### View Issue
```bash
# View issue
gh issue view 123

# With comments
gh issue view 123 --comments

# JSON output
gh issue view 123 --json title,body,labels,state

# Open in browser
gh issue view 123 --web
```

### Useful shortcuts
```bash
# Browse repo/issues/prs in browser
gh browse

# View status across repos
gh status

# Search
gh search issues "keyword" --repo owner/repo
```
