import { Metadata } from "next";
import { notFound } from "next/navigation";
import { allTools, getToolById } from "@/components/tools/tools-data";
import { ToolPageContent } from "./tool-page-content";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate static params for all 11 tools
export async function generateStaticParams() {
  return allTools.map((tool) => ({
    slug: tool.id,
  }));
}

// Dynamic metadata based on tool
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tool = getToolById(slug);

  if (!tool) {
    return {
      title: "Tool Not Found | think-mcp",
    };
  }

  return {
    title: `${tool.name} - ${tool.tagline} | think-mcp`,
    description: tool.description,
    openGraph: {
      title: `${tool.name} - ${tool.tagline}`,
      description: tool.description,
    },
  };
}

export default async function ToolPage({ params }: PageProps) {
  const { slug } = await params;
  const tool = getToolById(slug);

  if (!tool) {
    notFound();
  }

  // Pass only serializable data to client component
  // The client component will look up the icon by toolId
  return <ToolPageContent toolId={slug} />;
}
