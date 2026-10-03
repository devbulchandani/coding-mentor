export interface GitHubUser { login: string; name: string | null; avatar_url: string }
export interface GitHubRepository { id: number; name: string; full_name: string; html_url: string; default_branch: string; private: boolean; description: string | null }
export interface GitHubTreeEntry { path: string; mode: string; type: 'blob' | 'tree'; sha: string; size?: number }

async function githubRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`/github/api${path}`, {
    ...init,
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', ...init.headers },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = body.message || (response.status === 401 ? 'Connect your GitHub account to continue.' : `GitHub request failed (${response.status}).`);
    throw new Error(message);
  }
  return body as T;
}

export const githubApi = {
  connect: () => { window.location.assign('/github/oauth/start'); },
  disconnect: async () => { await fetch('/github/oauth/logout', { method: 'POST', credentials: 'same-origin' }); },
  getUser: () => githubRequest<GitHubUser>('/user'),
  listRepositories: () => githubRequest<GitHubRepository[]>('/user/repos?sort=updated&per_page=100&affiliation=owner,collaborator'),
  createRepository: (name: string, description: string, isPrivate: boolean) => githubRequest<GitHubRepository>('/user/repos', {
    method: 'POST', body: JSON.stringify({ name, description, private: isPrivate, auto_init: false }),
  }),
  initializeRepository: async (owner: string, repo: string, branch: string, files: Record<string, string>, message: string) => {
    const blobs = await Promise.all(Object.entries(files).map(async ([path, content]) => {
      const blob = await githubRequest<{ sha: string }>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/blobs`, {
        method: 'POST', body: JSON.stringify({ content, encoding: 'utf-8' }),
      });
      return { path, mode: '100644', type: 'blob', sha: blob.sha };
    }));
    const tree = await githubRequest<{ sha: string }>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees`, {
      method: 'POST', body: JSON.stringify({ tree: blobs }),
    });
    const commit = await githubRequest<{ sha: string }>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/commits`, {
      method: 'POST', body: JSON.stringify({ message, tree: tree.sha, parents: [] }),
    });
    await githubRequest(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/refs`, {
      method: 'POST', body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: commit.sha }),
    });
    return commit.sha;
  },
  getRepository: (owner: string, repo: string) => githubRequest<GitHubRepository>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`),
  getTree: (owner: string, repo: string, branch: string) => githubRequest<{ sha: string; tree: GitHubTreeEntry[]; truncated: boolean }>(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees/${encodeURIComponent(branch)}?recursive=1`,
  ),
  getBlob: async (owner: string, repo: string, sha: string) => {
    const blob = await githubRequest<{ content: string; encoding: string }>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/blobs/${encodeURIComponent(sha)}`);
    const bytes = Uint8Array.from(atob(blob.content.replace(/\s/g, '')), (character) => character.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  },
  commitFiles: async (owner: string, repo: string, branch: string, files: Record<string, string>, message: string) => {
    const reference = await githubRequest<{ object: { sha: string } }>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/ref/heads/${encodeURIComponent(branch)}`);
    const parent = await githubRequest<{ tree: { sha: string } }>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/commits/${reference.object.sha}`);
    const blobs = await Promise.all(Object.entries(files).map(async ([path, content]) => {
      const blob = await githubRequest<{ sha: string }>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/blobs`, {
        method: 'POST', body: JSON.stringify({ content, encoding: 'utf-8' }),
      });
      return { path, mode: '100644', type: 'blob', sha: blob.sha };
    }));
    const tree = await githubRequest<{ sha: string }>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees`, {
      method: 'POST', body: JSON.stringify({ base_tree: parent.tree.sha, tree: blobs }),
    });
    const commit = await githubRequest<{ sha: string }>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/commits`, {
      method: 'POST', body: JSON.stringify({ message, tree: tree.sha, parents: [reference.object.sha] }),
    });
    await githubRequest(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/refs/heads/${encodeURIComponent(branch)}`, {
      method: 'PATCH', body: JSON.stringify({ sha: commit.sha, force: false }),
    });
    return commit.sha;
  },
};

export function projectStarterFiles(plan: { title?: string; tech?: string; projectDescription?: string }) {
  const title = plan.title || 'My Learning Project';
  const description = plan.projectDescription || `A project workspace for ${title}.`;
  const tech = (plan.tech || '').toLowerCase();
  if (tech.includes('spring') || tech.includes('java')) {
    return {
      'README.md': `# ${title}\n\n${description}\n\n## Run locally\n\n\`\`\`bash\nmvn spring-boot:run\n\`\`\`\n\nThe starter endpoint is available at \`GET /api/hello\`.`,
      'pom.xml': `<?xml version="1.0" encoding="UTF-8"?>\n<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">\n  <modelVersion>4.0.0</modelVersion>\n  <parent><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-parent</artifactId><version>3.5.0</version><relativePath/></parent>\n  <groupId>dev.buildspace</groupId><artifactId>learning-project</artifactId><version>0.0.1-SNAPSHOT</version>\n  <properties><java.version>21</java.version></properties>\n  <dependencies><dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-web</artifactId></dependency><dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-test</artifactId><scope>test</scope></dependency></dependencies>\n  <build><plugins><plugin><groupId>org.springframework.boot</groupId><artifactId>spring-boot-maven-plugin</artifactId></plugin></plugins></build>\n</project>\n`,
      'src/main/java/dev/buildspace/project/ProjectApplication.java': `package dev.buildspace.project;\n\nimport org.springframework.boot.SpringApplication;\nimport org.springframework.boot.autoconfigure.SpringBootApplication;\n\n@SpringBootApplication\npublic class ProjectApplication {\n    public static void main(String[] args) {\n        SpringApplication.run(ProjectApplication.class, args);\n    }\n}\n`,
      'src/main/java/dev/buildspace/project/HelloController.java': `package dev.buildspace.project;\n\nimport org.springframework.web.bind.annotation.GetMapping;\nimport org.springframework.web.bind.annotation.RestController;\n\n@RestController\npublic class HelloController {\n    @GetMapping("/api/hello")\n    public String hello() {\n        return "Hello, Buildspace!";\n    }\n}\n`,
      'src/main/resources/application.properties': 'spring.application.name=learning-project\nserver.port=8080\n',
      '.gitignore': 'target/\n.idea/\n*.iml\n.DS_Store\n',
    };
  }

  return {
    'README.md': `# ${title}\n\n${description}\n\n## Getting started\n\nOpen \`index.html\` in your browser and begin building.`,
    'index.html': `<!doctype html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n  <title>${title}</title>\n  <link rel="stylesheet" href="src/style.css" />\n</head>\n<body>\n  <main class="card">\n    <p class="eyebrow">Your project starts here</p>\n    <h1>${title}</h1>\n    <p>${description}</p>\n    <button id="start">Let’s build</button>\n  </main>\n  <script type="module" src="src/main.js"></script>\n</body>\n</html>\n`,
    'src/main.js': `document.querySelector('#start').addEventListener('click', () => {\n  document.querySelector('#start').textContent = 'Nice work — keep going!';\n});\n`,
    'src/style.css': `:root { font-family: Inter, ui-sans-serif, system-ui, sans-serif; color: #172033; background: #f5f6fb; }\n* { box-sizing: border-box; }\nbody { min-height: 100vh; margin: 0; display: grid; place-items: center; padding: 24px; }\n.card { width: min(100%, 520px); padding: 40px; border: 1px solid #e5e7ef; border-radius: 24px; background: white; box-shadow: 0 16px 60px #252c4510; }\n.eyebrow { color: #5b55db; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .12em; }\nbutton { border: 0; border-radius: 12px; padding: 12px 18px; color: white; background: #4f46e5; font: inherit; font-weight: 650; cursor: pointer; }\n`,
    '.gitignore': '.DS_Store\nnode_modules/\n',
  };
}
