import { Metadata } from "next";
import { Suspense } from "react";
import { FeedbackDashboardContent } from "./feedback-dashboard-content";
import FeedbackLoading from "./loading";

export const metadata: Metadata = {
  title: "Feedback Dashboard | Think by Maslow AI",
  description:
    "Review user feedback on Think MCP tools. View ratings, comments, and issue reports to continuously improve tool quality.",
  openGraph: {
    title: "Feedback Dashboard | Think by Maslow AI",
    description:
      "Review user feedback on Think MCP tools. View ratings, comments, and issue reports to continuously improve tool quality.",
  },
  robots: {
    index: false, // Keep dashboard out of search results
    follow: false,
  },
};

export default function FeedbackPage() {
  return (
    <Suspense fallback={<FeedbackLoading />}>
      <FeedbackDashboardContent />
    </Suspense>
  );
}
