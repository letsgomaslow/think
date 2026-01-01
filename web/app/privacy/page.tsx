import Link from "next/link";
import { Footer } from "@/components/sections/footer";

export const metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for Think by Maslow AI - how we collect, use, and protect your data.",
};

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="text-slate-400 mb-12">Last updated: January 1, 2026</p>

          {/* Content */}
          <div className="prose prose-invert prose-slate max-w-none">
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 font-[family-name:var(--font-manrope)]">
                1. Information We Collect
              </h2>
              <p className="text-slate-300 mb-4 leading-relaxed">
                When you join our waitlist, we collect:
              </p>
              <ul className="text-slate-300 space-y-2 ml-6 list-disc">
                <li>Email address (required)</li>
                <li>Name (optional)</li>
                <li>Timestamp of signup</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 font-[family-name:var(--font-manrope)]">
                2. How We Use Your Information
              </h2>
              <p className="text-slate-300 mb-4 leading-relaxed">
                We use your information to:
              </p>
              <ul className="text-slate-300 space-y-2 ml-6 list-disc">
                <li>Notify you when we launch</li>
                <li>Send product updates and announcements</li>
                <li>Improve our services</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 font-[family-name:var(--font-manrope)]">
                3. Analytics & Cookies
              </h2>
              <p className="text-slate-300 mb-4 leading-relaxed">
                We use Google Analytics 4 to understand how visitors interact with our site. We have:
              </p>
              <ul className="text-slate-300 space-y-2 ml-6 list-disc">
                <li>Enabled IP anonymization</li>
                <li>Disabled Google signals</li>
                <li>Implemented cookie consent</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 font-[family-name:var(--font-manrope)]">
                4. Your Rights (GDPR)
              </h2>
              <p className="text-slate-300 mb-4 leading-relaxed">
                Under GDPR, you have the right to:
              </p>
              <ul className="text-slate-300 space-y-2 ml-6 list-disc">
                <li>Access your personal data</li>
                <li>Request deletion of your data</li>
                <li>Object to processing</li>
                <li>Data portability</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 font-[family-name:var(--font-manrope)]">
                5. Data Storage
              </h2>
              <p className="text-slate-300 mb-4 leading-relaxed">
                Your waitlist data is stored securely using Upstash Redis. We use Arcjet for email
                validation to block spam and disposable email addresses.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-bold text-white mb-4 font-[family-name:var(--font-manrope)]">
                6. Contact Us
              </h2>
              <p className="text-slate-300 mb-4 leading-relaxed">
                For privacy-related questions or to exercise your rights, contact us at:
              </p>
              <p className="text-[hsl(var(--brand-primary))]">
                <a href="mailto:hello@maslowai.com" className="hover:underline">
                  hello@maslowai.com
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
