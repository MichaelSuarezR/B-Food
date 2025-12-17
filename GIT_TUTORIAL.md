# BruinCoin Git Workflow

## Repository
https://github.com/jeffreyl1234/BruinCoin.git

## Branch Structure
- **`main`**: Default branch (both frontend & backend)
- **`frontend-main`**: Production frontend
- **`frontend-dev`**: Development frontend
- **`backend-main`**: Production backend
- **`backend-dev`**: Development backend

## Branch Rules
- ✅ Only merge tested code into main branches
- ❌ No direct commits to main branches
- ✅ Dev branches should always be functional

## Branch Naming
**Frontend:**
- `frontend-feature/user-auth`
- `frontend-feature/fix-profile-routing`
- `frontend-feature/security-patch`

**Backend:**
- `backend-feature/auth-api`
- `backend-feature/fix-database-connection`
- `backend-feature/payment-fix`

## Workflow

### 1. Create Branch
```bash
git checkout frontend-dev  # or backend-dev
git pull origin frontend-dev
git checkout -b frontend-feature/your-feature
```

### 2. Work & Commit
```bash
# Work in frontend/ or backend/ directory
git add frontend/  # or backend/
git commit -m "feat(frontend): add user authentication UI"
```

### 3. Push & PR
```bash
git push origin frontend-feature/your-feature
# Create PR: feature-branch → dev-branch
```

### 4. Code Review
- Assign reviewer
- Address feedback
- Get approval before merging

### 5. Merge to Dev
```bash
git checkout frontend-dev
git merge frontend-feature/your-feature
git push origin frontend-dev
```

### 6. Deploy to Production
```bash
git checkout frontend-main
git merge frontend-dev
git push origin frontend-main
```

## Commit Messages
**Good:**
- `feat(frontend): add user authentication UI`
- `fix(backend): resolve database timeout`
- `docs: update API documentation`

**Bad:**
- `fixed stuff`
- `updates`
- `WIP`

## Remember
- Test before pushing
- Pull latest changes before starting
- Delete merged feature branches
- Use descriptive names
