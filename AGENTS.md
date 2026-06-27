# AGENTS.md

This is a personal fork of [overleaf/overleaf](https://github.com/overleaf/overleaf) (the open-source LaTeX editor platform) maintained to carry a small OIDC login patch on top of upstream `main` for self-hosting Community Edition behind an Authelia SSO provider.

## Why this fork exists

Overleaf Community Edition ships only local email/password authentication — SSO (LDAP, SAML, OIDC) is gated behind the commercial Server Pro image. This fork re-applies the OIDC login patch originally authored by Erik Michelson ([ErikMichelson/overleaf-oidc](https://github.com/ErikMichelson/overleaf-oidc), commit `577c53d`) so that CE can delegate authentication to an external OIDC identity provider without a Server Pro license.

## Maintenance model

- **`main`** mirrors upstream `main` and is only updated by `git fetch upstream && git merge upstream/main`.
- **`add-oidc`** is a single clean commit on top of `main` that adds the OIDC login feature. It does **not** carry the unrelated git history from ErikMichelson's fork — the patch was re-applied manually against current upstream so that it rebases cleanly.
- **Upgrades** are a standard rebase: `git fetch upstream && git checkout add-oidc && git rebase upstream/main`. Any conflicts will be genuine OIDC-related ones, localized to: the Authentication controller, the User model, `UserPrimaryEmailCheckHandler`, `ExpressLocals`, `Features`, `Server` (passport setup), `router.mjs`, the two pug views (`login.pug`, `navbar-marketing.pug`), `server-ce/config/settings.js`, `services/web/config/settings.defaults.js`, `services/web/package.json`, and the `.gitignore` (plus the lockfile churn from upstream drift).
- The OIDC feature is configured entirely via `OVERLEAF_OIDC_*` environment variables read in `server-ce/config/settings.js`; no other runtime configuration is required.

## First-time setup

If cloning fresh, configure the upstream remote before running the upgrade flow:

```sh
git remote add upstream https://github.com/overleaf/overleaf.git
git fetch upstream
```
