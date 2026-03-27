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
