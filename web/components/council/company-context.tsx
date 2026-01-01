"use client";

import { motion } from "framer-motion";
import { Building2, MapPin, Users, Globe, TrendingUp, Package } from "lucide-react";
import type { CompanyProfile, QuarterlyMetrics } from "./council-demo-data";

// Synthetic company data: Bloom & Co. - DTC Beauty & Wellness
const companyProfile: CompanyProfile = {
  name: "Bloom & Co.",
  industry: "DTC Beauty & Wellness",
  founded: "2019",
  headquarters: "Austin, TX",
  employees: "120-150",
  currentMarkets: "US Only",
};

// 8 quarters of financial history (Q1 2023 - Q4 2024)
const quarterlyData: QuarterlyMetrics[] = [
  { quarter: "Q1 2023", gmv: 12.4, orders: 89, customers: 45, revenue: 11.8 },
  { quarter: "Q2 2023", gmv: 14.2, orders: 102, customers: 52, revenue: 13.5 },
  { quarter: "Q3 2023", gmv: 16.8, orders: 121, customers: 61, revenue: 16.0 },
  { quarter: "Q4 2023", gmv: 22.1, orders: 159, customers: 78, revenue: 21.0 },
  { quarter: "Q1 2024", gmv: 18.5, orders: 133, customers: 82, revenue: 17.6 },
  { quarter: "Q2 2024", gmv: 21.3, orders: 153, customers: 91, revenue: 20.2 },
  { quarter: "Q3 2024", gmv: 24.7, orders: 178, customers: 105, revenue: 23.5 },
  { quarter: "Q4 2024", gmv: 31.2, orders: 225, customers: 128, revenue: 29.6 },
];

// Calculate growth metrics
const yoyGrowth = Math.round(
  ((quarterlyData[7].revenue - quarterlyData[3].revenue) / quarterlyData[3].revenue) * 100
);
const q4Growth = Math.round(
  ((quarterlyData[7].revenue - quarterlyData[6].revenue) / quarterlyData[6].revenue) * 100
);

export function CompanyContext() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="rounded-xl border border-slate-700/50 bg-slate-800/30 overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-3 bg-slate-700/30 border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-[hsl(var(--brand-primary))]" />
          <h4 className="text-sm font-semibold text-white">Company Context</h4>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Synthetic scenario data for the European expansion decision
        </p>
      </div>

      <div className="p-4 space-y-4">
        {/* Company Profile */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <ProfileCard
            icon={<Building2 className="w-3.5 h-3.5" />}
            label="Company"
            value={companyProfile.name}
            subvalue={companyProfile.industry}
          />
          <ProfileCard
            icon={<MapPin className="w-3.5 h-3.5" />}
            label="Founded"
            value={companyProfile.founded}
            subvalue={companyProfile.headquarters}
          />
          <ProfileCard
            icon={<Users className="w-3.5 h-3.5" />}
            label="Team Size"
            value={companyProfile.employees}
            subvalue="employees"
          />
          <ProfileCard
            icon={<Globe className="w-3.5 h-3.5" />}
            label="Markets"
            value={companyProfile.currentMarkets}
            subvalue="Evaluating EU"
          />
          <ProfileCard
            icon={<TrendingUp className="w-3.5 h-3.5" />}
            label="YoY Growth"
            value={`${yoyGrowth}%`}
            subvalue="revenue growth"
            highlight
          />
          <ProfileCard
            icon={<Package className="w-3.5 h-3.5" />}
            label="Q4 2024"
            value={`$${quarterlyData[7].revenue}M`}
            subvalue={`+${q4Growth}% QoQ`}
            highlight
          />
        </div>

        {/* Narrative */}
        <div className="p-3 rounded-lg bg-slate-700/20 border border-slate-700/30">
          <p className="text-sm text-slate-300 leading-relaxed">
            <span className="font-semibold text-[hsl(var(--brand-primary))]">Bloom & Co.</span> is
            a direct-to-consumer beauty brand that has grown {yoyGrowth}% YoY in the US market.
            With strong Q4 2024 results and increasing customer retention, leadership is evaluating
            international expansion. <span className="text-amber-400">Three major EU competitors
            have recently raised Series B rounds</span>, creating urgency around the European market
            opportunity.
          </p>
        </div>

        {/* Quarterly Financials Table */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-slate-500" />
            <span className="text-xs uppercase tracking-wider text-slate-500">
              8-Quarter Performance
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-left py-2 px-2 text-slate-500 font-medium">Quarter</th>
                  <th className="text-right py-2 px-2 text-slate-500 font-medium">GMV</th>
                  <th className="text-right py-2 px-2 text-slate-500 font-medium">Orders</th>
                  <th className="text-right py-2 px-2 text-slate-500 font-medium">Customers</th>
                  <th className="text-right py-2 px-2 text-slate-500 font-medium">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {quarterlyData.map((q, index) => (
                  <motion.tr
                    key={q.quarter}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    viewport={{ once: true }}
                    className={`border-b border-slate-700/30 ${
                      index >= 4 ? "bg-slate-700/10" : ""
                    }`}
                  >
                    <td className="py-2 px-2 text-slate-300 font-medium">{q.quarter}</td>
                    <td className="py-2 px-2 text-right text-slate-400">${q.gmv}M</td>
                    <td className="py-2 px-2 text-right text-slate-400">{q.orders}K</td>
                    <td className="py-2 px-2 text-right text-slate-400">{q.customers}K</td>
                    <td className="py-2 px-2 text-right text-emerald-400 font-medium">
                      ${q.revenue}M
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Visual Bar Chart for Revenue Trend */}
        <div>
          <span className="text-xs uppercase tracking-wider text-slate-500 mb-2 block">
            Revenue Trend
          </span>
          <div className="flex items-end gap-1 h-16">
            {quarterlyData.map((q, index) => {
              const maxRevenue = Math.max(...quarterlyData.map((d) => d.revenue));
              const heightPercent = (q.revenue / maxRevenue) * 100;
              const isQ4 = q.quarter.includes("Q4");
              return (
                <motion.div
                  key={q.quarter}
                  initial={{ height: 0 }}
                  whileInView={{ height: `${heightPercent}%` }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  viewport={{ once: true }}
                  className={`flex-1 rounded-t transition-colors ${
                    isQ4
                      ? "bg-[hsl(var(--brand-primary))]"
                      : "bg-slate-600 hover:bg-slate-500"
                  }`}
                  title={`${q.quarter}: $${q.revenue}M`}
                />
              );
            })}
          </div>
          <div className="flex gap-1 mt-1">
            {quarterlyData.map((q) => (
              <div key={q.quarter} className="flex-1 text-center">
                <span className="text-[10px] text-slate-600">
                  {q.quarter.replace(" 20", "'")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Helper component for profile cards
function ProfileCard({
  icon,
  label,
  value,
  subvalue,
  highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subvalue: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`p-3 rounded-lg border ${
        highlight
          ? "bg-[hsl(var(--brand-primary)/0.1)] border-[hsl(var(--brand-primary)/0.3)]"
          : "bg-slate-700/20 border-slate-700/30"
      }`}
    >
      <div className="flex items-center gap-1.5 mb-1">
        <span className={highlight ? "text-[hsl(var(--brand-primary))]" : "text-slate-500"}>
          {icon}
        </span>
        <span className="text-[10px] uppercase tracking-wider text-slate-500">{label}</span>
      </div>
      <div
        className={`text-sm font-semibold ${
          highlight ? "text-[hsl(var(--brand-primary))]" : "text-white"
        }`}
      >
        {value}
      </div>
      <div className="text-[10px] text-slate-500">{subvalue}</div>
    </div>
  );
}

export default CompanyContext;
