export default function Home() {
  const mcpEndpoint =
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}/api/mcp`
      : 'http://localhost:3000/api/mcp';

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">think-mcp</h1>
          <p className="text-xl text-gray-600">
            Structured reasoning tools for AI assistants
          </p>
        </div>

        {/* MCP Endpoint Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            MCP Endpoint
          </h2>
          <div className="bg-gray-100 rounded-lg p-4 font-mono text-sm break-all">
            {mcpEndpoint}
          </div>
          <p className="mt-4 text-gray-600 text-sm">
            Connect this endpoint to Claude Desktop or ChatGPT to access 11
            structured reasoning tools.
          </p>
        </div>

        {/* Tools Overview */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Available Tools
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { name: 'trace', desc: 'Step-by-step thought tracing' },
              { name: 'model', desc: 'Mental models (first principles, pareto, etc.)' },
              { name: 'pattern', desc: 'Software design patterns' },
              { name: 'paradigm', desc: 'Programming paradigms' },
              { name: 'debug', desc: 'Systematic debugging approaches' },
              { name: 'council', desc: 'Multi-persona deliberation' },
              { name: 'decide', desc: 'Decision analysis frameworks' },
              { name: 'reflect', desc: 'Metacognitive monitoring' },
              { name: 'hypothesis', desc: 'Scientific method workflow' },
              { name: 'debate', desc: 'Dialectical reasoning' },
              { name: 'map', desc: 'Visual/spatial reasoning' },
            ].map((tool) => (
              <div
                key={tool.name}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200"
              >
                <code className="text-indigo-600 font-semibold">
                  {tool.name}
                </code>
                <p className="text-gray-600 text-sm mt-1">{tool.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Start */}
        <div className="bg-indigo-50 rounded-xl p-8">
          <h2 className="text-xl font-bold text-indigo-900 mb-4">
            Quick Start
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-indigo-800">Claude Desktop</h3>
              <p className="text-indigo-700 text-sm">
                Add to your claude_desktop_config.json:
              </p>
              <pre className="bg-white rounded-lg p-3 mt-2 text-xs overflow-x-auto">
{`{
  "mcpServers": {
    "think-mcp": {
      "command": "npx",
      "args": ["mcp-remote", "${mcpEndpoint}"]
    }
  }
}`}
              </pre>
            </div>
            <div>
              <h3 className="font-semibold text-indigo-800">ChatGPT</h3>
              <p className="text-indigo-700 text-sm">
                Settings → Connectors → Advanced → Developer Mode → Add URL
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-500 text-sm">
          <p>
            <a
              href="https://github.com/chirag127/think-mcp"
              className="text-indigo-600 hover:underline"
            >
              GitHub
            </a>
            {' · '}
            <a
              href="https://www.npmjs.com/package/think-mcp"
              className="text-indigo-600 hover:underline"
            >
              npm
            </a>
          </p>
          <p className="mt-2">Version 2.0.0</p>
        </footer>
      </div>
    </main>
  );
}
