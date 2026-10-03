# Buildspace frontend

React, TypeScript, and Vite frontend for Buildspace AI. It includes the project workspace, Monaco editor, GitHub integration, and Cloudflare Pages Functions.

## Local development

```bash
npm install
npm run dev
```

Vite uses `http://localhost:8080` for backend API requests by default. Set `VITE_API_BASE_URL` to point to a different API origin.

To exercise GitHub OAuth locally, build the frontend and run the Pages Functions through Wrangler:

```bash
npm run build
npx wrangler pages dev dist --port 8788
```

Add local-only values to an untracked `.dev.vars` file in this directory:

```text
GITHUB_OAUTH_CLIENT_ID=...
GITHUB_OAUTH_CLIENT_SECRET=...
GITHUB_SESSION_SECRET=...
APP_ORIGIN=http://localhost:8080
```

Configure the GitHub OAuth App callback to match the local callback URL, `http://localhost:8788/github/oauth/callback`. Do not commit `.dev.vars` or production credentials.

## Production GitHub OAuth

Production uses the Cloudflare Pages project `buildspace-ai` at `https://buildspace-ai.pages.dev`. Its OAuth callback is `https://buildspace-ai.pages.dev/github/oauth/callback`. The Pages Function exchanges the OAuth code server-side and encrypts the session token into an HttpOnly, Secure, SameSite cookie.

The production deployment needs these encrypted Pages secrets:

- `GITHUB_OAUTH_CLIENT_ID`
- `GITHUB_OAUTH_CLIENT_SECRET`
- `GITHUB_SESSION_SECRET` — use a random value, separate from the GitHub client secret

Set them in **Workers & Pages → buildspace-ai → Settings → Variables and Secrets** or with Wrangler. After changing bindings, deploy the Pages project again so the Functions runtime receives the updated values.

## Workspace behavior

Learners can connect an existing GitHub repository or create a private starter repository, edit or add files, and publish commits from the browser. The milestone verifier receives a bounded snapshot of the current source files. The in-browser preview supports static `index.html` projects; server-side apps such as Spring Boot can be edited and published, but need an isolated runtime to run.
