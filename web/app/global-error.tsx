"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, fontFamily: "system-ui, sans-serif" }}>
        <div
          style={{
            minHeight: "100vh",
            background: "#0f1729",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
        >
          <div style={{ textAlign: "center", maxWidth: "600px" }}>
            <h1 style={{ fontSize: "48px", fontWeight: "bold", color: "#fff", marginBottom: "16px" }}>
              Critical Error
            </h1>
            <p style={{ fontSize: "18px", color: "#cbd5e1", marginBottom: "32px" }}>
              Something went wrong. Please reload the page to continue.
            </p>
            <button
              onClick={reset}
              style={{
                padding: "12px 24px",
                borderRadius: "8px",
                background: "#6DC4AD",
                color: "#fff",
                fontWeight: "600",
                border: "none",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              Reload
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
