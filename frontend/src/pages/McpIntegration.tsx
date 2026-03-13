import { useState } from 'react';
import { Copy, Check, Plug, Code2, Terminal, ExternalLink } from 'lucide-react';
import useAppStore from '../hooks/useAppStore';

interface McpServer {
    name: string;
    description: string;
    config: Record<string, any>;
    tools: string[];
    color: string;
    requiresPlanId?: boolean;
}

interface Client {
    name: string;
    configPath: string;
    platform: string;
    docs: string;
}

const McpIntegration = () => {
    const { currentPlan } = useAppStore();
    const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

    const copyToClipboard = (text: string, index: string) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const mcpServers: McpServer[] = [
        {
            name: "Repo Analyzer",
            description: "Analyze GitHub repositories, read files, and understand project structure",
            config: {
                "repo-analyzer": {
                    "command": "npx",
                    "args": ["-y", "supergateway", "--streamableHttp", "https://buildspace-repo-analyzer-985437920499.asia-south1.run.app//mcp"]
                }
            },
            tools: ["analyze_project", "read_file", "read_files"],
            color: "sky"
        },
        {
            name: "Buildspace Learning Context",
            description: "Access your learning plan, milestones, progress, and get Socratic guidance",
            config: {
                "buildspace": {
                    "command": "npx",
                    "args": ["-y", "supergateway", "--streamableHttp", `https://buildspace-ai-mcp-2-985437920499.asia-south1.run.app/mcp/${currentPlan?.id || '{planId}'}`]
                }
            },
            tools: ["get_learning_plan", "get_current_milestone", "get_socratic_guidance", "get_milestone_details", "get_progress"],
            color: "purple",
            requiresPlanId: true
        }
    ];

    const clients: Client[] = [
        {
            name: "Claude Desktop",
            configPath: "~/Library/Application Support/Claude/claude_desktop_config.json",
            platform: "macOS",
            docs: "https://modelcontextprotocol.io/quickstart/user"
        },
        {
            name: "Kiro",
            configPath: "~/.kiro/settings/mcp.json",
            platform: "All",
            docs: "https://docs.kiro.ai/mcp"
        },
        {
            name: "Cursor",
            configPath: "~/.cursor/mcp.json",
            platform: "All",
            docs: "https://docs.cursor.com/mcp"
        },
        {
            name: "VS Code (Continue)",
            configPath: "~/.continue/config.json",
            platform: "All",
            docs: "https://docs.continue.dev/mcp"
        },
        {
            name: "Cline",
            configPath: "VS Code Extension Settings",
            platform: "All",
            docs: "https://github.com/cline/cline"
        }
    ];

    return (
        <div className="max-w-5xl mx-auto pb-10">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3 mb-2">
                    <Plug className="w-8 h-8 text-sky-600" />
                    MCP Integration
                </h1>
                <p className="text-slate-600">
                    Connect your learning context to any AI code editor or LLM using Model Context Protocol (MCP)
                </p>
            </div>

            {/* What is MCP */}
            <div className="bg-gradient-to-br from-indigo-50 to-sky-50 border border-indigo-100 rounded-xl p-6 mb-8">
                <h2 className="text-xl font-bold text-indigo-900 mb-3 flex items-center gap-2">
                    <Code2 className="w-5 h-5" />
                    What is MCP?
                </h2>
                <p className="text-indigo-800 mb-3">
                    Model Context Protocol (MCP) is an open standard that enables AI assistants to securely access external data sources and tools. 
                    By connecting these MCP servers to your favorite AI code editor, you can give it access to your learning plan context and repository analysis.
                </p>
                <a 
                    href="https://modelcontextprotocol.io" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                    Learn more about MCP
                    <ExternalLink className="w-4 h-4" />
                </a>
            </div>

            {/* Prerequisites */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
                <h3 className="font-bold text-yellow-900 mb-2 flex items-center gap-2">
                    <Terminal className="w-5 h-5" />
                    Prerequisites
                </h3>
                <ul className="space-y-2 text-sm text-yellow-800">
                    <li className="flex items-start gap-2">
                        <span className="text-yellow-600 mt-0.5">•</span>
                        <span>Node.js and npx must be installed on your system</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-yellow-600 mt-0.5">•</span>
                        <span>Have an MCP-compatible client installed (Claude Desktop, Kiro, Cursor, etc.)</span>
                    </li>
                </ul>
            </div>

            {/* MCP Servers */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Available MCP Servers</h2>
                <div className="grid gap-6">
                    {mcpServers.map((server, index) => (
                        <div key={index} className={`bg-white border border-${server.color}-200 rounded-xl overflow-hidden shadow-sm`}>
                            <div className={`bg-${server.color}-50 px-6 py-4 border-b border-${server.color}-100`}>
                                <h3 className={`text-lg font-bold text-${server.color}-900 mb-1`}>{server.name}</h3>
                                <p className={`text-sm text-${server.color}-700`}>{server.description}</p>
                            </div>
                            
                            <div className="p-6">
                                {server.requiresPlanId && !currentPlan && (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                                        <p className="text-sm text-yellow-800">
                                            ⚠️ Please select a learning plan first. The planId will be automatically included in the configuration.
                                        </p>
                                    </div>
                                )}

                                <div className="mb-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-semibold text-slate-700">Configuration</span>
                                        <button
                                            onClick={() => copyToClipboard(JSON.stringify(server.config, null, 2), `config-${index}`)}
                                            className="flex items-center gap-1 text-xs text-sky-600 hover:text-sky-700 font-medium"
                                        >
                                            {copiedIndex === `config-${index}` ? (
                                                <>
                                                    <Check className="w-3 h-3" />
                                                    Copied!
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="w-3 h-3" />
                                                    Copy
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg text-xs overflow-x-auto">
                                        <code>{JSON.stringify(server.config, null, 2)}</code>
                                    </pre>
                                </div>

                                <div>
                                    <span className="text-sm font-semibold text-slate-700 block mb-2">Available Tools</span>
                                    <div className="flex flex-wrap gap-2">
                                        {server.tools.map((tool, i) => (
                                            <span key={i} className={`px-2 py-1 bg-${server.color}-100 text-${server.color}-700 text-xs rounded-md font-mono`}>
                                                {tool}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Integration Instructions */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">How to Connect</h2>
                <div className="bg-white border border-slate-200 rounded-xl p-6">
                    <ol className="space-y-6">
                        <li className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-sky-500 text-white rounded-full flex items-center justify-center font-bold">
                                1
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-slate-800 mb-2">Locate your client's MCP configuration file</h3>
                                <p className="text-sm text-slate-600 mb-3">
                                    Each AI client stores MCP configurations in a different location. Find yours below:
                                </p>
                                <div className="space-y-2">
                                    {clients.map((client, i) => (
                                        <div key={i} className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="font-semibold text-sm text-slate-800">{client.name}</span>
                                                <span className="text-xs text-slate-500">{client.platform}</span>
                                            </div>
                                            <code className="text-xs text-slate-600 block mb-2">{client.configPath}</code>
                                            <a 
                                                href={client.docs} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-xs text-sky-600 hover:text-sky-700 inline-flex items-center gap-1"
                                            >
                                                Documentation
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </li>

                        <li className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-sky-500 text-white rounded-full flex items-center justify-center font-bold">
                                2
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-slate-800 mb-2">Add MCP server configurations</h3>
                                <p className="text-sm text-slate-600 mb-2">
                                    Copy the configuration from the MCP servers above and add them to your client's config file under the <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">mcpServers</code> section.
                                </p>
                                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                                    <p className="text-xs text-slate-600 mb-2">Example structure:</p>
                                    <pre className="bg-slate-900 text-slate-100 p-3 rounded text-xs overflow-x-auto">
{`{
  "mcpServers": {
    "repo-analyzer": { ... },
    "buildspace": { ... }
  }
}`}
                                    </pre>
                                </div>
                            </div>
                        </li>

                        <li className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-sky-500 text-white rounded-full flex items-center justify-center font-bold">
                                3
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-slate-800 mb-2">Restart your AI client</h3>
                                <p className="text-sm text-slate-600">
                                    Close and reopen your AI client application. The MCP servers should now be available and you can use the tools in your conversations!
                                </p>
                            </div>
                        </li>

                        <li className="flex gap-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-sky-500 text-white rounded-full flex items-center justify-center font-bold">
                                4
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-slate-800 mb-2">Test the connection</h3>
                                <p className="text-sm text-slate-600 mb-2">
                                    Try asking your AI assistant to use the tools:
                                </p>
                                <div className="space-y-2">
                                    <div className="bg-sky-50 border border-sky-200 rounded-lg p-3">
                                        <p className="text-xs font-mono text-sky-900">"Analyze my repository structure"</p>
                                    </div>
                                    <div className="bg-sky-50 border border-sky-200 rounded-lg p-3">
                                        <p className="text-xs font-mono text-sky-900">"What's my current milestone?"</p>
                                    </div>
                                    <div className="bg-sky-50 border border-sky-200 rounded-lg p-3">
                                        <p className="text-xs font-mono text-sky-900">"Give me Socratic guidance for my learning"</p>
                                    </div>
                                </div>
                            </div>
                        </li>
                    </ol>
                </div>
            </div>

            {/* Troubleshooting */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                <h2 className="text-xl font-bold text-slate-800 mb-4">Troubleshooting</h2>
                <div className="space-y-3 text-sm text-slate-700">
                    <div>
                        <p className="font-semibold mb-1">MCP servers not showing up?</p>
                        <p className="text-slate-600">Make sure your backend is running and the ports (3000, 3001) are accessible. Check your client's logs for connection errors.</p>
                    </div>
                    <div>
                        <p className="font-semibold mb-1">Tools not working?</p>
                        <p className="text-slate-600">Verify that npx is installed and can run the supergateway package. Try running the command manually in your terminal.</p>
                    </div>
                    <div>
                        <p className="font-semibold mb-1">Need help?</p>
                        <p className="text-slate-600">Check the <a href="https://modelcontextprotocol.io/docs" target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline">MCP documentation</a> or your client's specific MCP integration guide.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default McpIntegration;
