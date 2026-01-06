import Link from "next/link";
import { Footer } from "@/components/sections/footer";

export const metadata = {
  title: "Terms of Service",
  description: "Terms of service for Think by Maslow AI - rules and guidelines for using our platform.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[hsl(var(--surface-dark))]">
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[hsl(var(--brand-primary))] hover:text-[hsl(var(--brand-primary)/0.8)] mb-8 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>

          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 font-[family-name:var(--font-manrope)]">
            Terms of Service
          </h1>
          <p className="text-slate-400 mb-12">Last updated: January 1, 2026</p>

          {/* Content */}
          <div className="prose prose-invert prose-slate max-w-none">
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 font-[family-name:var(--font-manrope)]">
                1. Acceptance of Terms
              </h2>
              <p className="text-slate-300 mb-4 leading-relaxed">
                By accessing or using Think by Maslow AI, you agree to be bound by these Terms of Service
                and all applicable laws and regulations.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 font-[family-name:var(--font-manrope)]">
                2. Description of Service
              </h2>
              <p className="text-slate-300 mb-4 leading-relaxed">
                Think is a visual AI reasoning platform that provides mental models, debugging approaches,
                and collaborative reasoning tools through the Model Context Protocol (MCP).
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 font-[family-name:var(--font-manrope)]">
                3. Waitlist Terms
              </h2>
              <p className="text-slate-300 mb-4 leading-relaxed">
                By joining our waitlist:
              </p>
              <ul className="text-slate-300 space-y-2 ml-6 list-disc">
                <li>You consent to receive email communications about our launch</li>
                <li>You can unsubscribe at any time</li>
                <li>Your position on the waitlist does not guarantee access</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 font-[family-name:var(--font-manrope)]">
                4. Use License
              </h2>
              <p className="text-slate-300 mb-4 leading-relaxed">
                Permission is granted to temporarily use Think for personal, non-commercial purposes. This
                license shall automatically terminate if you violate any of these restrictions.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 font-[family-name:var(--font-manrope)]">
                5. Prohibited Uses
              </h2>
              <p className="text-slate-300 mb-4 leading-relaxed">
                You may not:
              </p>
              <ul className="text-slate-300 space-y-2 ml-6 list-disc">
                <li>Use the service for any unlawful purpose</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with or disrupt the service</li>
                <li>Use automated systems to access the service without permission</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 font-[family-name:var(--font-manrope)]">
                6. Disclaimer
              </h2>
              <p className="text-slate-300 mb-4 leading-relaxed">
                The service is provided "as is" without warranties of any kind, either express or implied.
                We do not warrant that the service will be uninterrupted or error-free.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 font-[family-name:var(--font-manrope)]">
                7. Limitation of Liability
              </h2>
              <p className="text-slate-300 mb-4 leading-relaxed">
                In no event shall Maslow AI be liable for any damages arising out of the use or inability
                to use the service.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 font-[family-name:var(--font-manrope)]">
                8. Changes to Terms
              </h2>
              <p className="text-slate-300 mb-4 leading-relaxed">
                We reserve the right to modify these terms at any time. Continued use of the service after
                changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 font-[family-name:var(--font-manrope)]">
                9. Contact Information
              </h2>
              <p className="text-slate-300 mb-4 leading-relaxed">
                For questions about these Terms, contact us at:
              </p>
              <p className="text-[hsl(var(--brand-primary))]">
                <a href="mailto:rakesh@maslow.ai" className="hover:underline">
                  rakesh@maslow.ai
                </a>
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
