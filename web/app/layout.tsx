import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'think-mcp - Structured Reasoning Tools for AI',
  description:
    '11 mental models and reasoning frameworks for AI assistants via the Model Context Protocol.',
  keywords: [
    'MCP',
    'Model Context Protocol',
    'AI',
    'reasoning',
    'mental models',
    'Claude',
    'ChatGPT',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
