# BruinCoin Development Workflow

## 🌳 Branch Structure

```
bruinCoin/
├── main                    # Default branch (both frontend & backend)
├── frontend-main          # Production frontend
├── frontend-dev           # Development frontend
├── frontend-feature/*     # Frontend feature branches
├── backend-main           # Production backend
├── backend-dev            # Development backend
└── backend-feature/*      # Backend feature branches
```

## 🚀 Getting Started

### 1. Clone Repository
```bash
git clone <repo-url>
cd bruinCoin
```

### 2. Check Available Branches
```bash
git branch -a
```

## 👨‍💻 Frontend Development Workflow

### Starting a New Feature
```bash
# Switch to frontend dev branch
git checkout frontend-dev

# Pull latest changes
git pull origin frontend-dev

# Create feature branch
git checkout -b frontend-feature/user-authentication

# Work on your feature in frontend/ directory
cd frontend
# Make changes...
```

### Committing Changes
```bash
# Add changes
git add frontend/

# Commit with descriptive message
git commit -m "feat(frontend): add user authentication UI"

# Push feature branch
git push origin frontend-feature/user-authentication
```

### Merging to Development
```bash
# Switch to frontend-dev
git checkout frontend-dev

# Merge feature branch
git merge frontend-feature/user-authentication

# Push to remote
git push origin frontend-dev

# Delete feature branch (optional)
git branch -d frontend-feature/user-authentication
git push origin --delete frontend-feature/user-authentication
```

### Deploying to Production
```bash
# Switch to frontend-main
git checkout frontend-main

# Merge from frontend-dev
git merge frontend-dev

# Push to production
git push origin frontend-main
```

## 🔧 Backend Development Workflow

### Starting a New Feature
```bash
# Switch to backend dev branch
git checkout backend-dev

# Pull latest changes
git pull origin backend-dev

# Create feature branch
git checkout -b backend-feature/api-endpoints

# Work on your feature in backend/ directory
cd backend
# Make changes...
```

### Committing Changes
```bash
# Add changes
git add backend/

# Commit with descriptive message
git commit -m "feat(backend): add user authentication API endpoints"

# Push feature branch
git push origin backend-feature/api-endpoints
```

### Merging to Development
```bash
# Switch to backend-dev
git checkout backend-dev

# Merge feature branch
git merge backend-feature/api-endpoints

# Push to remote
git push origin backend-dev

# Delete feature branch (optional)
git branch -d backend-feature/api-endpoints
git push origin --delete backend-feature/api-endpoints
```

### Deploying to Production
```bash
# Switch to backend-main
git checkout backend-main

# Merge from backend-dev
git merge backend-dev

# Push to production
git push origin backend-main
```

## 🔄 Cross-Team Coordination

### When Frontend and Backend Need to Work Together

1. **API Contract Changes**
   - Backend team creates `backend-feature/api-changes`
   - Frontend team creates `frontend-feature/integrate-api-changes`
   - Both teams coordinate on API specifications

2. **Database Schema Changes**
   - Backend team updates database schema
   - Frontend team adapts to new data structure
   - Use `main` branch for shared documentation

### Synchronizing Branches
```bash
# If you need to sync frontend-dev with backend changes
git checkout frontend-dev
git merge backend-dev

# If you need to sync backend-dev with frontend changes
git checkout backend-dev
git merge frontend-dev
```

## 🚨 Emergency Hotfixes

### Frontend Hotfix
```bash
# Create hotfix from frontend-main
git checkout frontend-main
git checkout -b frontend-hotfix/critical-bug-fix

# Make urgent changes
# Commit and push
git add frontend/
git commit -m "hotfix(frontend): fix critical authentication bug"
git push origin frontend-hotfix/critical-bug-fix

# Merge to both frontend-main and frontend-dev
git checkout frontend-main
git merge frontend-hotfix/critical-bug-fix
git push origin frontend-main

git checkout frontend-dev
git merge frontend-hotfix/critical-bug-fix
git push origin frontend-dev
```

### Backend Hotfix
```bash
# Create hotfix from backend-main
git checkout backend-main
git checkout -b backend-hotfix/security-patch

# Make urgent changes
# Commit and push
git add backend/
git commit -m "hotfix(backend): patch security vulnerability"
git push origin backend-hotfix/security-patch

# Merge to both backend-main and backend-dev
git checkout backend-main
git merge backend-hotfix/security-patch
git push origin backend-main

git checkout backend-dev
git merge backend-hotfix/security-patch
git push origin backend-dev
```

## 📋 Best Practices

### Branch Naming
- **Features**: `frontend-feature/description` or `backend-feature/description`
- **Hotfixes**: `frontend-hotfix/description` or `backend-hotfix/description`
- **Bug fixes**: `frontend-fix/description` or `backend-fix/description`

### Commit Messages
- Use conventional commits: `type(scope): description`
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- Scopes: `frontend`, `backend`

### Pull Request Process
1. Create PR from feature branch to appropriate dev branch
2. Request review from team members
3. Address feedback and update PR
4. Merge after approval
5. Delete feature branch after merge

### Code Review Checklist
- [ ] Code follows project conventions
- [ ] No console.logs or debug code
- [ ] Environment variables properly configured
- [ ] No hardcoded secrets or API keys
- [ ] Tests pass (when available)
- [ ] Documentation updated if needed
