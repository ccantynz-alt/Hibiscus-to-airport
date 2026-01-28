AGENT DEPLOY PIPELINE (PR -> Preview -> Deploy)
==============================================

Stage 1: PR Mode (recommended starting point)
---------------------------------------------
1) Agents produce a unified git patch (agent.patch) against the Hibiscus repo.
2) You run GitHub Actions workflow: "Agent PR (Apply Patch -> PR)"
   - instruction: what you asked for
   - patch_url: URL to the patch
3) Workflow applies patch on a new branch and opens a PR
4) Vercel automatically runs a Preview Deployment on the PR
5) You visually test the Preview URL
6) You merge the PR
7) Vercel deploys Production from main

Stage 2: AUTO Mode (after trust is built)
-----------------------------------------
Same as above, but set auto_merge=true on the workflow input.
This adds label "auto-merge", and auto-merge workflow will enable auto-merge
ONLY if:
- Checks are green
- PR is not draft
- Forbidden files were NOT modified:
  - package.json / lockfiles (dependency changes)
  - vercel config
  - workflows
  - env files

IMPORTANT:
- Agents NEVER push to main.
- Production changes only happen via PR merge (manual or auto-merge).

How to host patch files (patch_url)
-----------------------------------
- Simplest: store patch text in a private server endpoint you control (Render backend) that returns the patch file.
- Or: GitHub Gist (raw) / any HTTPS endpoint accessible to GitHub Actions.

Kill switch
-----------
Disable auto-merge by:
- removing "auto-merge" label from PRs
- or disabling the auto-merge workflow in GitHub Actions.