# GitHub Actions Workflows

This directory contains automated CI/CD workflows for ShiriniBe-De.

## Workflows

### 1. CI (Continuous Integration)
**File:** `ci.yml`  
**Triggers:** Push to `main`/`develop`, Pull requests

Runs on every commit and PR to ensure code quality:

- **Lint** - Runs ESLint to check code style
- **Type Check** - TypeScript compiler validation
- **Build** - Next.js build verification
- **Security** - Dependency vulnerability audit
- **Summary** - Overall CI status check

All steps must pass before merging to main branch.

### 2. Code Quality
**File:** `code-quality.yml`  
**Triggers:** Push to `main`/`develop`, Weekly schedule

Periodic code quality analysis:

- Detects console statements in production code
- Finds TODO/FIXME comments
- Checks for unused variables
- Monitors bundle size
- Audits dependencies for updates
- Checks license compatibility

### 3. Deploy
**File:** `deploy.yml`  
**Triggers:** Push to `main`, Manual workflow dispatch

Production deployment pipeline:

- Runs full CI checks
- Builds with production environment variables
- Creates GitHub deployment
- Updates deployment status
- Requires `production` environment approval

## Environment Setup

### Required Secrets

Add these to your GitHub repository settings under **Settings > Secrets and variables > Actions**:

```
NEXT_PUBLIC_API_URL=https://api.shirinibe-de.com
```

### Required Environment Variables

For production deployments, create a `production` environment in your repository with:

- Environment protection rules (require approvals)
- Required reviewers
- Deployment branches (only `main`)

## Badge

Add this to your README.md to show CI status:

```markdown
[![CI](https://github.com/shirinibe-de/shirini-webapp/actions/workflows/ci.yml/badge.svg)](https://github.com/shirinibe-de/shirini-webapp/actions/workflows/ci.yml)
```

## Local Testing

Test workflows locally using [act](https://github.com/nektos/act):

```bash
# Install act
brew install act

# Run CI workflow locally
act -j lint

# Run specific job
act -j build
```

## Customization

### Disable Jobs

Comment out or remove job entries in the workflow files to disable them.

### Change Node Version

Update `node-version` in all workflows (currently set to `'20'`).

### Add New Steps

Add new steps under any job section. Example:

```yaml
- name: My Custom Step
  run: echo "Running custom step"
```

### Conditional Execution

Skip steps based on conditions:

```yaml
- name: Deploy
  if: github.ref == 'refs/heads/main'
  run: npm run deploy
```

## Troubleshooting

### Workflow Not Triggering

- Check branch name matches trigger conditions
- Ensure file is in `.github/workflows/` directory
- Verify YAML syntax is correct

### Build Failures

- Check Node version compatibility
- Run `npm ci` locally to verify dependencies
- Review error logs in GitHub Actions UI

### Deployment Issues

- Verify production environment is configured
- Check required secrets are set
- Review deployment protection rules

## References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [act - Run GitHub Actions Locally](https://github.com/nektos/act)
