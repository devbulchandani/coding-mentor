# React + Vite

## Buildspace project workspace

The in-browser workspace uses the GitHub OAuth web flow through Cloudflare Pages Functions. Before enabling it in production:

1. Register a GitHub OAuth App with homepage `https://buildspace-ai.pages.dev` and callback `https://buildspace-ai.pages.dev/github/oauth/callback`. Request only the `repo` scope needed to create and edit the user's project repositories.
2. In Cloudflare, open **Workers & Pages → buildspace-ai → Settings → Variables and Secrets**. Add `GITHUB_OAUTH_CLIENT_ID`, `GITHUB_OAUTH_CLIENT_SECRET`, and `GITHUB_SESSION_SECRET` for Production (and Preview if needed). Mark the client secret and session secret as encrypted secrets. Generate a unique session secret with `openssl rand -hex 32` and do not commit it.
3. Redeploy the Pages project so the Function runtime receives the new secrets.

The Pages Function exchanges the OAuth code server-side and puts the GitHub token in an encrypted, HttpOnly, Secure, SameSite cookie. GitHub tokens are not saved in browser storage. The editor commits through the GitHub API and sends a bounded source-file snapshot to the signed-in Buildspace user's milestone verifier.

The current lightweight preview runs static `index.html` projects in a sandboxed iframe. Spring Boot and other server-side apps can be edited and published here; running those frameworks needs an isolated build runtime.

## Local development

Run the frontend with Vite as usual. GitHub OAuth uses Pages Functions, so run through `npx wrangler pages dev dist` with the GitHub Function environment values in an untracked `.dev.vars` file when you need to exercise the connection and publish flow locally.

---

## Vite starter template

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
