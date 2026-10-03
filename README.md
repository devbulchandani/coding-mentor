# Buildspace AI

Buildspace AI turns a learning goal into a working software project. Learners create a plan, connect a GitHub repository, build in the browser workspace, and ask an AI mentor to review their code against each milestone.

## What you can do

- Generate a project plan with ordered milestones from a goal, experience level, and available time.
- Connect an existing GitHub repository or create a private starter repository from the website.
- Edit and create project files in the in-app Monaco editor, then publish commits to GitHub.
- Preview static `index.html` projects in the workspace. Server-side projects such as Spring Boot can be edited and published; they need a separate runtime to run.
- Submit the current project files for AI milestone verification and receive feedback tied to the milestone.
- Get project-aware guidance through the mentor chat and MCP context tools.

## Architecture

```text
Learner browser
      |
Cloudflare Pages: React app + GitHub OAuth Functions <----> GitHub API
      |
      +---------------- REST API ----------------+
                                               AWS
                                      Spring Boot backend
                                     /        |         \
                                  MySQL   Bedrock      MCP services
                                          GPT-OSS
```

The frontend is hosted on Cloudflare Pages. The Spring backend, MySQL database, and MCP services run on AWS. The plan, mentor, and notes language-model flows use GPT-OSS through Amazon Bedrock. GitHub OAuth secrets and the encrypted OAuth session are managed by Cloudflare Pages Functions; GitHub tokens are held in a secure, HttpOnly cookie and are not stored in browser local storage.

## Repository layout

| Path | Purpose |
| --- | --- |
| `frontend/` | React application, Cloudflare Pages Functions, and GitHub integration |
| `backend/` | Spring Boot API, persistence, mentor, and milestone verification |
| `mcp/` | Repository analysis MCP service |
| `buildspace-mcp/` | Learning-plan context MCP service |

## Run locally

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend uses `http://localhost:8080` for the API during Vite development by default. Set `VITE_API_BASE_URL` to use another backend URL.

### Backend

The backend requires a reachable MySQL database and the Bedrock environment values below. From `backend/`:

```bash
mvn spring-boot:run
```

Required environment variables:

| Variable | Purpose |
| --- | --- |
| `MYSQL_URL` | JDBC URL for MySQL |
| `MYSQL_USER` / `MYSQL_PASSWORD` | MySQL credentials |
| `AWS_BEARER_TOKEN_BEDROCK` | Bedrock Mantle bearer token |

Optional variables include `AWS_REGION` (defaults to `ap-south-1`), `BEDROCK_MODEL_ID` (defaults to `openai.gpt-oss-20b`), `MCP_REPO_URL` (defaults to `http://localhost:8081/mcp`), and `APP_CORS_ALLOWED_ORIGINS` (defaults to the production site and local Vite origin). Keep credentials in an untracked environment file or secret manager; do not commit them.

### GitHub OAuth during local development

GitHub sign-in runs in Cloudflare Pages Functions. To exercise it locally, create an OAuth App callback URL for `http://localhost:8788/github/oauth/callback`, then run Pages Functions through Wrangler:

```bash
cd frontend
npm run build
npx wrangler pages dev dist --port 8788
```

Supply the following values in an untracked `frontend/.dev.vars` file:

```text
GITHUB_OAUTH_CLIENT_ID=...
GITHUB_OAUTH_CLIENT_SECRET=...
GITHUB_SESSION_SECRET=...
APP_ORIGIN=http://localhost:8080
```

Never commit `.dev.vars` or production credentials. Production OAuth is configured for `https://buildspace-ai.pages.dev`; its callback is `https://buildspace-ai.pages.dev/github/oauth/callback`.

## Deployments

- Frontend and GitHub Functions: Cloudflare Pages project `buildspace-ai`, production branch `main`.
- Backend and supporting services: AWS. Configure secrets and service environment values in the deployment environment rather than in source control.

## Tech stack

- **Frontend:** React, TypeScript, Vite, Zustand, Monaco Editor
- **Backend:** Java 17, Spring Boot, Spring Data JPA, Spring Security/JWT
- **AI:** Amazon Bedrock GPT-OSS
- **Database:** MySQL
- **Integrations:** GitHub OAuth/API, Cloudflare Pages Functions, MCP

## Current limitations

- In-browser preview supports static HTML projects. Running Java or other server-side projects requires an isolated build and execution runtime.
- The GitHub integration requests repository access so it can create repositories and publish commits on the learner's behalf.

## License

MIT
