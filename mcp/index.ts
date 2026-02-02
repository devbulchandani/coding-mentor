import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { simpleGit, CleanOptions, type SimpleGit } from "simple-git";
import fs from "fs-extra";
import path from "path";
import { z } from "zod";


const server = new McpServer({
    name: "repo-analyzer",
    version: "1.0.0"
});



async function cloneRepo(repoUrl: string): Promise<string> {
    const repoName = repoUrl.split("/").pop()?.replace(".git", "") || "repo";
    const repoPath = path.join("/tmp", `repo-${Date.now()}-${repoName}`);

    if (await fs.pathExists(repoPath)) {
        await fs.remove(repoPath);
    }

    const git: SimpleGit = simpleGit();
    const sshUrl = repoUrl
        .replace("https://github.com/", "git@github.com:")
        .replace(/\/$/, "");

    await git.clone(sshUrl, repoPath);


    return repoPath;
}

async function readTree(
    dir: string,
    maxFiles = 5000
): Promise<any> {
    let fileCount = 0;

    async function _read(currentDir: string): Promise<any> {
        const entries = await fs.readdir(currentDir, { withFileTypes: true });
        const tree: any = {};

        for (const entry of entries) {
            if (
                entry.name === "node_modules" ||
                entry.name.startsWith(".")
            ) continue;

            fileCount++;
            if (fileCount > maxFiles) {
                return { warning: "Too many files — stopped early" };
            }

            const fullPath = path.join(currentDir, entry.name);

            tree[entry.name] = entry.isDirectory()
                ? await _read(fullPath)
                : "file";
        }

        return tree;
    }

    return _read(dir);
}

async function readFile(filePath: string) {
    const stats = await fs.stat(filePath);

    if (stats.size > 100_000) {
        return "File too large to analyze";
    }

    return fs.readFile(filePath, "utf-8");
}



server.registerTool(
    "analyze_project",
    {
        description: "Analyze the structure of a git repository",
        inputSchema: {
            repoUrl: z.string()
        }
    },
    async ({ repoUrl }) => {
        const repoPath = await cloneRepo(repoUrl);
        const tree = await readTree(repoPath);

        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(tree, null, 2),
                },
            ],
        };
    }
);


server.registerTool(
    "read_file",
    {
        description: "Read the contents of a file in a git repository",
        inputSchema: {
            filePath: z.string(),
            repoUrl: z.string()
        }

    },
    async ({ repoUrl, filePath }) => {
        const repoPath = await cloneRepo(repoUrl);
        const fullPath = path.join(repoPath, filePath);

        const content = await readFile(fullPath);

        return {
            content: [{ type: "text", text: content }],
        };
    }
);

server.registerTool(
    "read_files",
    {
        description: "Read the contents of multiple files in a git repository",
        inputSchema: {
            repoUrl: z.string(),
            filePaths: z.array(z.string()),
        }
    },
    async ({ repoUrl, filePaths }) => {
        const repoPath = await cloneRepo(repoUrl);

        const results: Record<string, string> = {};

        for (const fp of filePaths) {
            const fullPath = path.join(repoPath, fp);
            results[fp] = await readFile(fullPath);
        }

        return {
            content: [{ type: "text", text: JSON.stringify(results, null, 2) }],
        };
    }
);

const transport = new StdioServerTransport();
await server.connect(transport);

console.error("Repo Analyzer MCP running...");






