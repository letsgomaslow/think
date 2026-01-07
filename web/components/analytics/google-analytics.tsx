"use client";

import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Script from "next/script";
import type { CSPNonce } from "@/lib/security/csp";

interface GoogleAnalyticsProps {
  nonce?: CSPNonce;
}

function GoogleAnalyticsContent({ nonce }: GoogleAnalyticsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

    if (!measurementId || typeof window === "undefined") return;

    // Track page views
    const url = pathname + searchParams.toString();
    window.gtag("config", measurementId, {
      page_path: url,
    });
  }, [pathname, searchParams]);

  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  if (!measurementId) {
    return null;
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        nonce={nonce}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        nonce={nonce}
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', '${measurementId}', {
              page_path: window.location.pathname,
              anonymize_ip: true,
              allow_google_signals: false
            });
          `,
        }}
      />
    </>
  );
}

export function GoogleAnalytics({ nonce }: GoogleAnalyticsProps) {
  return (
    <Suspense fallback={null}>
      <GoogleAnalyticsContent nonce={nonce} />
    </Suspense>
  );
}
