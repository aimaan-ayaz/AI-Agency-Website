"use client";

import { useState, useRef, useEffect, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToday } from "@/lib/use-today";

const services = [
  {
    id: "websites",
    title: "Website Building",
    description:
      "Pixel perfect landing pages, brand defining portfolios, and conversion ready storefronts. Engineered for speed, tuned for trust, built to print revenue.",
  },
  {
    id: "saas",
    title: "SaaS Development",
    description:
      "Production grade platforms with auth, billing, dashboards, and infrastructure baked in. Real software, real users, real MRR by week one.",
  },
  {
    id: "ai-automation",
    title: "AI Automation",
    description:
      "Autonomous agents that ship content, qualify leads, and run support around the clock. Trade manual grind for compounding leverage.",
  },
];

function MobileServiceHeading({
  index,
  service,
}: {
  index: number;
  service: { title: string; description: string };
}) {
  const num = String(index + 1).padStart(2, "0");
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="lg:hidden"
    >
      <div className="flex items-center gap-3 mb-3 font-inter">
        <span className="text-[10px] text-white/40 font-mono tracking-[0.3em]">{num}</span>
        <div className="w-6 h-px bg-white/20" />
        <span className="text-[10px] text-white/45 font-mono tracking-[0.3em] uppercase">
          {index === 0 ? "Build" : index === 1 ? "Launch" : "Automate"}
        </span>
      </div>
      <h3 className="font-walsheim text-2xl sm:text-3xl font-bold text-white tracking-tight leading-[1.15] mb-3">
        {service.title}
      </h3>
      <p className="font-inter text-white/55 text-sm leading-[1.6] max-w-md">
        {service.description}
      </p>
    </motion.div>
  );
}

function ScreenFrame({
  children,
  title,
  aspectClass = "aspect-[16/10]",
}: {
  children: ReactNode;
  title: string;
  aspectClass?: string;
}) {
  return (
    <div className="relative rounded-xl overflow-hidden bg-zinc-950 border border-white/[0.08] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.03)_inset]">
      <div className="flex items-center gap-2 px-3 py-2 bg-black/60 backdrop-blur-xl border-b border-white/[0.06]">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.06] rounded-md px-2.5 py-0.5 text-[10px] text-white/45 font-mono">
            <svg className="w-2.5 h-2.5 opacity-50" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
              <rect x="3" y="5" width="6" height="5" rx="0.5" />
              <path d="M4.5 5V3.5a1.5 1.5 0 0 1 3 0V5" />
            </svg>
            {title}
          </div>
        </div>
        <div className="w-12 hidden sm:block" />
      </div>

      <div className={`${aspectClass} bg-black overflow-hidden relative`}>
        {children}
      </div>
    </div>
  );
}

function WebsiteVisual() {
  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-15% 0px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <ScreenFrame title="project-02.zaid.studio" aspectClass="aspect-[16/9]">
          <video
            src="/showcase/website-2.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="w-full h-full object-cover"
          />
        </ScreenFrame>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-15% 0px" }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      >
        <ScreenFrame title="project-01.zaid.studio" aspectClass="aspect-[16/9]">
          <video
            src="/showcase/website-1.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="w-full h-full object-cover"
          />
        </ScreenFrame>
      </motion.div>
    </div>
  );
}

const SIDEBAR_ICONS = [
  "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z",
  "M4 6h16M4 12h10M4 18h16",
  "M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  "M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z",
  "M21 12a9 9 0 11-18 0 9 9 0 0118 0zM12 8v4l3 2",
];

function useInterval(callback: () => void, delay: number, enabled: boolean = true) {
  const savedCallback = useRef(callback);
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  useEffect(() => {
    if (!enabled) return;
    const tick = () => savedCallback.current();
    const id = setInterval(tick, delay);
    return () => clearInterval(id);
  }, [delay, enabled]);
}

function useInViewRef<T extends Element>(rootMargin: string = "200px") {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);
  return [ref, inView] as const;
}

function MiniSparkline({ points, color }: { points: number[]; color: string }) {
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const coords = points
    .map((v, i) => `${(i / (points.length - 1)) * 100},${100 - ((v - min) / range) * 100}`)
    .join(" ");
  return (
    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
      <motion.polyline
        animate={{ points: coords }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        vectorEffect="non-scaling-stroke"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const ACTIVITY_POOL = [
  { who: "Aarav Rao", action: "upgraded to Pro", dot: "bg-emerald-400" },
  { who: "Maya Lin", action: "paid $8,900 invoice", dot: "bg-violet-400" },
  { who: "Jonas Klein", action: "invited 3 teammates", dot: "bg-cyan-400" },
  { who: "Zara Bashir", action: "connected Stripe", dot: "bg-amber-400" },
  { who: "Priya Iyer", action: "started 14 day trial", dot: "bg-emerald-400" },
  { who: "Tomás Núñez", action: "renewed yearly plan", dot: "bg-violet-400" },
  { who: "Liam Hart", action: "added webhook", dot: "bg-cyan-400" },
  { who: "Nia Okafor", action: "exported analytics", dot: "bg-amber-400" },
  { who: "Diego Costa", action: "upgraded to Scale", dot: "bg-violet-400" },
  { who: "Sana Iqbal", action: "viewed billing page", dot: "bg-cyan-400" },
];

function timeAgo(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m`;
}

function SaaSDashboard() {
  const [rootRef, inView] = useInViewRef<HTMLDivElement>();
  const [revenue, setRevenue] = useState(248290);
  const [chartData, setChartData] = useState([35, 48, 32, 58, 42, 68, 55, 78, 62, 88, 70, 95]);
  const [spark1, setSpark1] = useState([3, 5, 4, 6, 5, 7, 8, 9, 8, 10]);
  const [spark2, setSpark2] = useState([4, 4, 5, 6, 6, 7, 7, 8, 9, 10]);
  const [spark3, setSpark3] = useState([7, 8, 7, 9, 8, 9, 10, 9, 10, 10]);
  const [activityCursor, setActivityCursor] = useState(0);
  const [activity, setActivity] = useState(
    ACTIVITY_POOL.slice(0, 4).map((a, i) => ({ ...a, age: i * 60 + 20, key: i }))
  );
  const [tick, setTick] = useState(0);

  useInterval(() => {
    setRevenue((r) => r + 18 + Math.floor(Math.random() * 60));
  }, 1100, inView);

  useInterval(() => {
    setChartData((prev) => [...prev.slice(1), 50 + Math.floor(Math.random() * 50)]);
  }, 1400, inView);

  useInterval(() => {
    setSpark1((p) => [...p.slice(1), 4 + Math.floor(Math.random() * 8)]);
    setSpark2((p) => [...p.slice(1), 4 + Math.floor(Math.random() * 7)]);
    setSpark3((p) => [...p.slice(1), 7 + Math.floor(Math.random() * 4)]);
  }, 1700, inView);

  useInterval(() => {
    setActivityCursor((c) => (c + 1) % ACTIVITY_POOL.length);
    setActivity((prev) => {
      const next = (activityCursor + 4) % ACTIVITY_POOL.length;
      const newItem = { ...ACTIVITY_POOL[next], age: 0, key: Date.now() };
      const aged = prev.map((a) => ({ ...a, age: a.age + 3 }));
      return [newItem, ...aged.slice(0, 3)];
    });
  }, 2400, inView);

  useInterval(() => setTick((t) => t + 1), 1000, inView);

  const stats = [
    { label: "MRR", value: "$48.2k", delta: "+12%", spark: spark1, color: "rgba(52,211,153,0.95)" },
    { label: "Users", value: "2,847", delta: "+8%", spark: spark2, color: "rgba(167,139,250,0.95)" },
    { label: "Retention", value: "94%", delta: "+2%", spark: spark3, color: "rgba(56,189,248,0.95)" },
  ];

  return (
    <div ref={rootRef} className="w-full h-full flex bg-gradient-to-br from-zinc-950 via-black to-zinc-950 font-sans">
      <div className="w-12 border-r border-white/[0.05] bg-black/30 flex flex-col items-center py-3 gap-1.5">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-[10px] font-bold text-black mb-2">Z</div>
        {SIDEBAR_ICONS.map((d, i) => (
          <div key={i} className={`w-8 h-8 rounded-md flex items-center justify-center ${i === 0 ? "bg-white/[0.08] text-white" : "text-white/25"}`}>
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d={d} />
            </svg>
          </div>
        ))}
      </div>

      <div className="flex-1 flex flex-col gap-2.5 p-4 min-w-0">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] text-white/35 font-mono mb-0.5">
              <span>Workspace</span>
              <span className="text-white/20">/</span>
              <span className="text-white/60">Dashboard</span>
            </div>
            <p className="text-white text-sm font-semibold">Welcome back, Zaid</p>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-md px-2 py-1 text-[10px] text-white/45 flex items-center gap-1.5">
              <svg className="w-2.5 h-2.5" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="3" width="10" height="9" rx="1" />
                <path d="M2 6h10" />
              </svg>
              Last 30d
            </div>
            <div className="bg-emerald-500/15 border border-emerald-400/20 text-emerald-300 rounded-md px-2 py-1 text-[10px] font-medium">Export</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.06] rounded-lg p-3 flex items-end gap-3 relative overflow-hidden">
          <div className="flex-1 min-w-0 relative z-10">
            <p className="text-white/40 text-[9px] uppercase tracking-[0.22em] mb-1">Total Revenue</p>
            <p className="text-white text-2xl font-bold tracking-tight leading-none tabular-nums">${revenue.toLocaleString("en-US")}</p>
            <p className="text-emerald-400 text-[10px] mt-1.5 flex items-center gap-1 font-medium">
              <svg className="w-2.5 h-2.5" viewBox="0 0 12 12" fill="currentColor"><path d="M6 2l4 4H2z" /></svg>
              +18.3% vs prev period
              <span className="text-white/30 font-mono">· live</span>
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.4, repeat: Infinity }}
                className="w-1 h-1 rounded-full bg-emerald-400"
              />
            </p>
          </div>
          <div className="w-1/2 h-16 relative">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 60" preserveAspectRatio="none">
              <defs>
                <linearGradient id="rev-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(52,211,153,0.3)" />
                  <stop offset="100%" stopColor="rgba(52,211,153,0)" />
                </linearGradient>
              </defs>
              <motion.path
                d="M0,50 C20,46 40,48 60,40 C80,32 100,38 120,26 C140,18 160,24 180,12 L200,8"
                fill="none"
                stroke="rgba(52,211,153,0.9)"
                strokeWidth="1.5"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: "easeOut" }}
              />
              <motion.path
                d="M0,50 C20,46 40,48 60,40 C80,32 100,38 120,26 C140,18 160,24 180,12 L200,8 L200,60 L0,60 Z"
                fill="url(#rev-grad)"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.4 }}
              />
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 + i * 0.06, duration: 0.4 }}
              className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-2.5 flex flex-col gap-1.5"
            >
              <div className="flex items-center justify-between">
                <p className="text-white/35 text-[8px] uppercase tracking-[0.2em]">{stat.label}</p>
                <p className="text-emerald-400 text-[9px] font-mono font-medium">{stat.delta}</p>
              </div>
              <p className="text-white text-base font-bold tracking-tight leading-none">{stat.value}</p>
              <div className="h-5 w-full">
                <MiniSparkline points={stat.spark} color={stat.color} />
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex-1 bg-white/[0.02] border border-white/[0.06] rounded-lg flex flex-col overflow-hidden min-h-0">
          <div className="px-3 py-2 border-b border-white/[0.04] flex items-center justify-between">
            <p className="text-white/65 text-[11px] font-medium">Recent activity</p>
            <span className="flex items-center gap-1 text-[9px] text-white/35 font-mono">
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.6, repeat: Infinity }}
                className="w-1 h-1 rounded-full bg-emerald-400"
              />
              live
            </span>
          </div>
          <div className="flex-1 flex flex-col">
            <AnimatePresence initial={false}>
              {activity.map((item) => (
                <motion.div
                  key={item.key}
                  layout
                  initial={{ opacity: 0, height: 0, x: -8 }}
                  animate={{ opacity: 1, height: "auto", x: 0 }}
                  exit={{ opacity: 0, height: 0, x: 8 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-center gap-2.5 px-3 py-1.5 border-t border-white/[0.03] first:border-t-0 overflow-hidden"
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${item.dot} shrink-0`} />
                  <p className="text-white text-[11px] font-medium">{item.who}</p>
                  <p className="text-white/40 text-[11px] flex-1 truncate">{item.action}</p>
                  <p className="text-white/30 text-[10px] font-mono tabular-nums">{timeAgo(item.age + tick)}</p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

const CUSTOMER_POOL = [
  { initials: "AR", name: "Aarav Rao", email: "aarav@northwind.io", plan: "Pro", mrr: "$2,400", status: "online", color: "from-orange-400 to-red-500" },
  { initials: "ML", name: "Maya Lin", email: "maya@stratosfera.app", plan: "Scale", mrr: "$8,900", status: "online", color: "from-violet-400 to-fuchsia-500" },
  { initials: "JK", name: "Jonas Klein", email: "jk@oslohaus.de", plan: "Pro", mrr: "$2,400", status: "away", color: "from-emerald-400 to-cyan-500" },
  { initials: "ZB", name: "Zara Bashir", email: "zara@hypelab.co", plan: "Starter", mrr: "$480", status: "offline", color: "from-amber-400 to-pink-500" },
  { initials: "TN", name: "Tomás Núñez", email: "tn@meridian.fm", plan: "Scale", mrr: "$8,900", status: "online", color: "from-sky-400 to-indigo-500" },
  { initials: "PI", name: "Priya Iyer", email: "priya@boundless.co", plan: "Pro", mrr: "$2,400", status: "online", color: "from-rose-400 to-fuchsia-500" },
  { initials: "LH", name: "Liam Hart", email: "liam@frameworx.io", plan: "Pro", mrr: "$2,400", status: "online", color: "from-teal-400 to-emerald-500" },
  { initials: "NO", name: "Nia Okafor", email: "nia@orbitlabs.com", plan: "Scale", mrr: "$8,900", status: "online", color: "from-pink-400 to-purple-500" },
  { initials: "DC", name: "Diego Costa", email: "diego@radius.studio", plan: "Pro", mrr: "$2,400", status: "away", color: "from-indigo-400 to-violet-500" },
  { initials: "SI", name: "Sana Iqbal", email: "sana@northport.io", plan: "Starter", mrr: "$480", status: "online", color: "from-amber-400 to-orange-500" },
];

function SaaSCustomers() {
  const [rootRef, inView] = useInViewRef<HTMLDivElement>();
  const [startIdx, setStartIdx] = useState(0);
  const [stamp, setStamp] = useState(0);

  useInterval(() => {
    setStartIdx((i) => (i + 1) % CUSTOMER_POOL.length);
    setStamp((s) => s + 1);
  }, 1900, inView);

  const visible = Array.from({ length: 6 }, (_, i) => {
    const c = CUSTOMER_POOL[(startIdx + i) % CUSTOMER_POOL.length];
    return { ...c, key: `${c.email}-${stamp + i}` };
  });

  const statusColor: Record<string, string> = {
    online: "bg-emerald-400",
    away: "bg-amber-400",
    offline: "bg-white/20",
  };

  const planColor: Record<string, string> = {
    Starter: "bg-white/[0.06] text-white/60 border-white/[0.08]",
    Pro: "bg-cyan-500/10 text-cyan-300 border-cyan-400/20",
    Scale: "bg-violet-500/10 text-violet-300 border-violet-400/20",
  };

  return (
    <div ref={rootRef} className="w-full h-full flex bg-gradient-to-br from-zinc-950 via-black to-zinc-950">
      <div className="w-12 border-r border-white/[0.05] bg-black/30 flex flex-col items-center py-3 gap-1.5">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-[10px] font-bold text-black mb-2">Z</div>
        {SIDEBAR_ICONS.map((d, i) => (
          <div key={i} className={`w-8 h-8 rounded-md flex items-center justify-center ${i === 3 ? "bg-white/[0.08] text-white" : "text-white/25"}`}>
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d={d} />
            </svg>
          </div>
        ))}
      </div>

      <div className="flex-1 flex flex-col p-4 gap-3 min-w-0">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-white text-sm font-semibold">Customers</p>
            <p className="text-white/35 text-[10px] mt-0.5 flex items-center gap-1.5">
              2,847 accounts · 1,294 paying
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1 h-1 rounded-full bg-emerald-400 ml-0.5"
              />
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="bg-white/[0.04] border border-white/[0.08] rounded-md px-2 py-1 flex items-center gap-1.5 text-white/45 text-[10px]">
              <svg className="w-2.5 h-2.5" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="6" cy="6" r="4" />
                <path d="m12 12-3-3" />
              </svg>
              Search
            </div>
            <div className="bg-emerald-500/15 border border-emerald-400/20 text-emerald-300 rounded-md px-2 py-1 text-[10px] font-medium">+ Invite</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Trial → Paid", value: "38.4%", color: "rgba(52,211,153,0.9)" },
            { label: "Avg LTV", value: "$3,420", color: "rgba(167,139,250,0.9)" },
            { label: "Churn", value: "1.9%", color: "rgba(244,114,182,0.9)" },
          ].map((s) => (
            <div key={s.label} className="bg-white/[0.02] border border-white/[0.06] rounded-md p-2 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-white/35 text-[8px] uppercase tracking-[0.2em]">{s.label}</p>
                <p className="text-white text-xs font-bold tracking-tight mt-0.5">{s.value}</p>
              </div>
              <div className="w-12 h-5 shrink-0">
                <MiniSparkline points={[3, 4, 4, 5, 6, 7, 7, 8, 9, 10]} color={s.color} />
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          {["All", "Pro", "Scale", "Starter"].map((chip, i) => (
            <div
              key={chip}
              className={`text-[10px] px-2 py-0.5 rounded-full border ${i === 0 ? "bg-white/10 text-white border-white/15" : "bg-transparent text-white/45 border-white/[0.08]"}`}
            >
              {chip}
            </div>
          ))}
          <span className="text-white/25 text-[10px] ml-auto font-mono">6 of 1,294</span>
        </div>

        <div className="flex-1 bg-white/[0.02] border border-white/[0.06] rounded-lg overflow-hidden min-h-0 flex flex-col">
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-3 px-3 py-1.5 border-b border-white/[0.06] text-[9px] text-white/30 uppercase tracking-[0.2em]">
            <span>Customer</span>
            <span>Plan</span>
            <span className="text-right w-14">MRR</span>
            <span className="w-3" />
          </div>
          <div className="flex-1 flex flex-col">
            <AnimatePresence mode="popLayout" initial={false}>
              {visible.map((c) => (
                <motion.div
                  key={c.key}
                  layout
                  initial={{ opacity: 0, y: -10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.98 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 px-3 py-1.5 border-b border-white/[0.03] last:border-b-0 flex-1"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`relative w-6 h-6 rounded-full bg-gradient-to-br ${c.color} flex items-center justify-center text-[9px] font-bold text-black/80 shrink-0`}>
                      {c.initials}
                      <span className={`absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ring-2 ring-black ${statusColor[c.status]}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-[11px] font-medium truncate leading-tight">{c.name}</p>
                      <p className="text-white/35 text-[9px] truncate font-mono">{c.email}</p>
                    </div>
                  </div>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-medium ${planColor[c.plan]}`}>
                    {c.plan}
                  </span>
                  <span className="text-white/70 text-[11px] font-mono tabular-nums text-right w-14">{c.mrr}</span>
                  <span className="text-white/25 text-xs">›</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function SaaSVisual() {
  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-15% 0px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <ScreenFrame title="app.zaid.studio/customers">
          <SaaSCustomers />
        </ScreenFrame>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-15% 0px" }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      >
        <ScreenFrame title="app.zaid.studio">
          <SaaSDashboard />
        </ScreenFrame>
      </motion.div>
    </div>
  );
}

const LIVE_LOG_POOL = [
  { text: "✓ Tweet scheduled · @growth", color: "text-emerald-400" },
  { text: "→ Embedding 12 docs · RAG", color: "text-white/40" },
  { text: "✓ Lead captured · stratosfera.app", color: "text-emerald-400" },
  { text: "→ Generating SEO copy · batch 4", color: "text-white/40" },
  { text: "✓ Reply sent · ticket #1284", color: "text-emerald-400" },
  { text: "→ Reranking 84 results · MRR", color: "text-violet-400" },
  { text: "✓ Outbound · 12 emails sent", color: "text-emerald-400" },
  { text: "→ Indexing changelog · cron", color: "text-white/40" },
  { text: "✓ Slack thread · #ops updated", color: "text-emerald-400" },
  { text: "→ Analyzing feedback · 24 items", color: "text-violet-400" },
  { text: "✓ Blog draft · queued for review", color: "text-emerald-400" },
  { text: "✓ Crawl complete · 1,284 URLs", color: "text-emerald-400" },
];

const INITIAL_TERMINAL_LINES = [
  { text: "$ zaid-agent run --workspace prod", color: "text-white/80" },
  { text: "→ Loading agents from config...", color: "text-white/40" },
  { text: "✓ Resolved 5 agents · 12 tools", color: "text-emerald-400" },
  { text: "→ Connecting to vector store...", color: "text-white/40" },
  { text: "✓ Connected · 2.4M embeddings", color: "text-emerald-400" },
  { text: "→ Deploying agents to cluster...", color: "text-white/40" },
  { text: "✓ Agent.SocialMedia · ready", color: "text-emerald-400" },
  { text: "✓ Agent.LeadGen · ready", color: "text-emerald-400" },
  { text: "✓ Agent.Support · ready", color: "text-emerald-400" },
  { text: "✓ Agent.Analytics · ready", color: "text-emerald-400" },
  { text: "✓ Agent.Outbound · ready", color: "text-emerald-400" },
  { text: "→ Stream open · listening", color: "text-violet-400" },
];

function AITerminal() {
  const [rootRef, inView] = useInViewRef<HTMLDivElement>();
  const [lines, setLines] = useState(() => INITIAL_TERMINAL_LINES.map((l, i) => ({ ...l, key: i })));
  const [keyCounter, setKeyCounter] = useState(INITIAL_TERMINAL_LINES.length);
  const [tasksMin, setTasksMin] = useState(12);
  const [tokens, setTokens] = useState(4.2);
  const [success] = useState(98.7);

  useInterval(() => {
    const pick = LIVE_LOG_POOL[Math.floor(Math.random() * LIVE_LOG_POOL.length)];
    setLines((prev) => {
      const next = [...prev, { ...pick, key: keyCounter }];
      return next.slice(-13);
    });
    setKeyCounter((c) => c + 1);
  }, 1200, inView);

  useInterval(() => {
    setTasksMin((t) => Math.max(8, Math.min(18, t + (Math.random() > 0.5 ? 1 : -1))));
    setTokens((t) => +(t + (Math.random() * 0.05 - 0.01)).toFixed(2));
  }, 900, inView);

  const nodes = [
    { angle: 270, label: "ADS", x: 0, y: -1, sub: "12 active" },
    { angle: 342, label: "SEO", x: 0.95, y: -0.31, sub: "8 active" },
    { angle: 54, label: "LEADS", x: 0.81, y: 0.59, sub: "24 active" },
    { angle: 126, label: "CRM", x: -0.81, y: 0.59, sub: "16 active" },
    { angle: 198, label: "BOT", x: -0.95, y: -0.31, sub: "32 active" },
  ];

  return (
    <div ref={rootRef} className="w-full h-full flex flex-col bg-gradient-to-br from-zinc-950 via-black to-zinc-950">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06] text-[10px] font-mono">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.4, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-emerald-400"
            />
            live · prod
          </span>
          <span className="text-white/40">5 <span className="text-white/65">agents</span></span>
          <span className="text-white/40">success <span className="text-emerald-300">{success}%</span></span>
          <span className="text-white/40">tasks/min <span className="text-white/65 tabular-nums">{tasksMin}</span></span>
          <span className="text-white/40">tokens <span className="text-white/65 tabular-nums">{tokens}M</span></span>
        </div>
        <span className="text-white/30">workspace/main</span>
      </div>

      <div className="flex-1 grid grid-cols-[1fr_1.05fr] gap-3 p-3 min-h-0">
        <div className="bg-black/60 border border-white/[0.06] rounded-lg flex flex-col overflow-hidden">
          <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-white/[0.06]">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500/60" />
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/60" />
            <div className="w-1.5 h-1.5 rounded-full bg-green-500/60" />
            <span className="text-white/40 text-[9px] ml-1.5 font-mono">agents.terminal · zsh</span>
          </div>
          <div className="flex-1 px-3 py-2 flex flex-col gap-0.5 overflow-hidden">
            <AnimatePresence initial={false}>
              {lines.map((line) => (
                <motion.div
                  key={line.key}
                  layout
                  initial={{ opacity: 0, x: -6, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                  className={`${line.color} text-[11px] font-mono leading-tight overflow-hidden`}
                >
                  {line.text}
                </motion.div>
              ))}
            </AnimatePresence>
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-white/70 text-[11px] font-mono mt-auto"
            >
              ▊
            </motion.span>
          </div>
        </div>

        <div className="bg-black/60 border border-white/[0.06] rounded-lg flex flex-col overflow-hidden relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(168,85,247,0.12),transparent_60%)] pointer-events-none" />
          <div className="px-3 py-1.5 border-b border-white/[0.06] flex items-center justify-between relative z-10">
            <p className="text-white/65 text-[11px] font-medium">Agent Network</p>
            <span className="text-[9px] text-white/40 font-mono">5 / 5 online</span>
          </div>

          <div className="flex-1 flex items-center justify-center relative">
            <svg className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="net-grid" width="8" height="8" patternUnits="userSpaceOnUse">
                  <path d="M 8 0 L 0 0 0 8" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.2" />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#net-grid)" />
            </svg>

            <div className="relative w-60 h-60">
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 240 240">
                {nodes.map((node, i) => {
                  const cx = 120 + node.x * 90;
                  const cy = 120 + node.y * 90;
                  return (
                    <g key={node.label}>
                      <motion.line
                        x1="120"
                        y1="120"
                        x2={cx}
                        y2={cy}
                        stroke="rgba(168,85,247,0.5)"
                        strokeWidth="0.8"
                        strokeDasharray="3,3"
                        initial={{ pathLength: 0 }}
                        whileInView={{ pathLength: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.6 + i * 0.08, duration: 0.6 }}
                      />
                      <motion.circle
                        cx={cx}
                        cy={cy}
                        r="2.5"
                        fill="rgba(168,85,247,0.95)"
                        initial={{ offsetDistance: "0%", opacity: 0 }}
                        animate={{ offsetDistance: "100%", opacity: [0, 1, 0] }}
                        transition={{
                          duration: 2.5,
                          repeat: Infinity,
                          delay: i * 0.3 + 1.5,
                          ease: "linear",
                        }}
                        style={{
                          offsetPath: `path('M 120 120 L ${cx} ${cy}')`,
                        }}
                      />
                    </g>
                  );
                })}
              </svg>

              <motion.div
                animate={{ scale: [1, 1.06, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex flex-col items-center justify-center text-white shadow-[0_0_50px_rgba(168,85,247,0.5)] z-10"
              >
                <span className="text-[8px] font-mono opacity-70">CORE</span>
                <span className="text-[11px] font-bold tracking-tight">v4.2</span>
              </motion.div>

              {nodes.map((node, i) => {
                const x = node.x * 90;
                const y = node.y * 90;
                return (
                  <motion.div
                    key={node.label}
                    initial={{ scale: 0, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + i * 0.1, type: "spring", stiffness: 200 }}
                    style={{
                      top: `calc(50% + ${y}px)`,
                      left: `calc(50% + ${x}px)`,
                    }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
                  >
                    <div className="bg-zinc-900 border border-white/15 rounded-lg px-2 py-1 flex items-center gap-1.5 backdrop-blur shadow-xl">
                      <motion.span
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2 }}
                        className="w-1 h-1 rounded-full bg-emerald-400"
                      />
                      <div>
                        <p className="text-white text-[9px] font-bold tracking-wider leading-none">{node.label}</p>
                        <p className="text-white/35 text-[7px] font-mono mt-0.5">{node.sub}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-white/[0.06] grid grid-cols-3 gap-2 px-3 py-1.5 relative z-10">
            <div>
              <p className="text-white/30 text-[8px] uppercase tracking-[0.2em]">Tasks</p>
              <p className="text-white text-[11px] font-mono mt-0.5 tabular-nums">1,284</p>
            </div>
            <div>
              <p className="text-white/30 text-[8px] uppercase tracking-[0.2em]">Latency</p>
              <p className="text-white text-[11px] font-mono mt-0.5">240<span className="text-white/40">ms</span></p>
            </div>
            <div>
              <p className="text-white/30 text-[8px] uppercase tracking-[0.2em]">Errors</p>
              <p className="text-emerald-400 text-[11px] font-mono mt-0.5">0</p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/[0.06] px-4 py-1.5 flex items-center gap-3 text-[10px] font-mono overflow-hidden">
        <span className="text-white/35 shrink-0">recent</span>
        <motion.div
          animate={{ x: [0, -300] }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="flex items-center gap-3 shrink-0"
        >
          <span className="text-emerald-300">✓ Tweet posted</span>
          <span className="text-white/25">·</span>
          <span className="text-emerald-300">✓ Lead captured @hypelab</span>
          <span className="text-white/25">·</span>
          <span className="text-violet-300">→ Embedding 124 docs</span>
          <span className="text-white/25">·</span>
          <span className="text-emerald-300">✓ Email reply sent</span>
          <span className="text-white/25">·</span>
          <span className="text-emerald-300">✓ Slack notified #growth</span>
          <span className="text-white/25">·</span>
          <span className="text-violet-300">→ Reranking results</span>
        </motion.div>
      </div>
    </div>
  );
}

type RunStatus = "ok" | "warn" | "err";

function AIWorkflow() {
  const flowNodes = [
    { id: "email", label: "Inbound Email", sub: "support@", x: 8, y: 22, icon: "✉", tone: "white" },
    { id: "form", label: "Form Submit", sub: "/contact", x: 8, y: 50, icon: "▢", tone: "white" },
    { id: "api", label: "API Trigger", sub: "POST /event", x: 8, y: 78, icon: "⌁", tone: "white" },
    { id: "filter", label: "Filter", sub: "spam · lang", x: 30, y: 30, icon: "▼", tone: "amber" },
    { id: "classify", label: "Classify", sub: "intent · tag", x: 30, y: 70, icon: "◇", tone: "cyan" },
    { id: "core", label: "AGENT", sub: "gpt-4o", x: 52, y: 50, icon: "✦", tone: "violet" },
    { id: "db", label: "Database", sub: "postgres", x: 78, y: 22, icon: "▤", tone: "emerald" },
    { id: "slack", label: "Slack", sub: "#growth", tone: "violet", x: 78, y: 50, icon: "◆" },
    { id: "reply", label: "Send Reply", sub: "auto", x: 78, y: 78, icon: "↪", tone: "cyan" },
  ];

  const edges = [
    { from: "email", to: "filter" },
    { from: "form", to: "filter" },
    { from: "form", to: "classify" },
    { from: "api", to: "classify" },
    { from: "filter", to: "core" },
    { from: "classify", to: "core" },
    { from: "core", to: "db" },
    { from: "core", to: "slack" },
    { from: "core", to: "reply" },
  ];

  const nodeMap = Object.fromEntries(flowNodes.map((n) => [n.id, n]));

  const toneStyle: Record<string, string> = {
    white: "bg-white/[0.05] border-white/[0.1] text-white/80",
    amber: "bg-amber-500/10 border-amber-400/25 text-amber-200",
    cyan: "bg-cyan-500/10 border-cyan-400/25 text-cyan-200",
    emerald: "bg-emerald-500/10 border-emerald-400/25 text-emerald-200",
    violet: "bg-violet-500/15 border-violet-400/30 text-violet-100",
  };

  const [rootRef, inView] = useInViewRef<HTMLDivElement>();
  const [runsToday, setRunsToday] = useState(1284);
  const [latency, setLatency] = useState(240);
  const [chartBars, setChartBars] = useState([40, 55, 38, 60, 50, 72, 65, 88, 70, 92, 80, 96]);
  const [runs, setRuns] = useState<{ id: string; status: RunStatus; time: string; key: number }[]>([
    { id: "#1284", status: "ok", time: "184ms", key: 1284 },
    { id: "#1283", status: "ok", time: "212ms", key: 1283 },
    { id: "#1282", status: "ok", time: "168ms", key: 1282 },
    { id: "#1281", status: "warn", time: "612ms", key: 1281 },
    { id: "#1280", status: "ok", time: "194ms", key: 1280 },
    { id: "#1279", status: "ok", time: "208ms", key: 1279 },
    { id: "#1278", status: "ok", time: "176ms", key: 1278 },
    { id: "#1277", status: "ok", time: "200ms", key: 1277 },
  ]);
  const [nextRunId, setNextRunId] = useState(1285);

  useInterval(() => {
    const rand = Math.random();
    const status: RunStatus = rand < 0.06 ? "warn" : rand < 0.005 ? "err" : "ok";
    const time = `${150 + Math.floor(Math.random() * (status === "warn" ? 500 : 80))}ms`;
    setRuns((prev) => [
      { id: `#${nextRunId}`, status, time, key: nextRunId },
      ...prev.slice(0, 7),
    ]);
    setRunsToday((r) => r + 1);
    setLatency((l) => Math.max(160, Math.min(320, l + Math.floor(Math.random() * 30 - 15))));
    setNextRunId((n) => n + 1);
  }, 1300, inView);

  useInterval(() => {
    setChartBars((prev) => [...prev.slice(1), 40 + Math.floor(Math.random() * 60)]);
  }, 1000, inView);

  const statusColor: Record<RunStatus, string> = {
    ok: "bg-emerald-400",
    warn: "bg-amber-400",
    err: "bg-rose-400",
  };

  return (
    <div ref={rootRef} className="w-full h-full bg-gradient-to-br from-zinc-950 via-black to-zinc-950 flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-[10px] font-bold">F</div>
          <div>
            <p className="text-white text-xs font-semibold leading-tight">Workflow · Inbound Triage</p>
            <p className="text-white/35 text-[9px] font-mono mt-0.5">v4.2 · last edit 6h ago · by Zaid</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono">
          <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 border border-emerald-400/20 rounded-md px-2 py-1">
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.4, repeat: Infinity }}
              className="w-1 h-1 rounded-full bg-emerald-400"
            />
            Running
          </span>
          <span className="text-white/40 bg-white/[0.04] border border-white/[0.08] rounded-md px-2 py-1 tabular-nums">{latency}ms avg</span>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-[1fr_180px] gap-3 p-3 min-h-0">
        <div className="bg-black/40 border border-white/[0.05] rounded-lg relative overflow-hidden">
          <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="edge-grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="rgba(168,85,247,0.15)" />
                <stop offset="50%" stopColor="rgba(168,85,247,0.6)" />
                <stop offset="100%" stopColor="rgba(168,85,247,0.15)" />
              </linearGradient>
            </defs>
            {edges.map((e, i) => {
              const from = nodeMap[e.from];
              const to = nodeMap[e.to];
              if (!from || !to) return null;
              const midX = (from.x + to.x) / 2;
              const d = `M ${from.x} ${from.y} C ${midX} ${from.y}, ${midX} ${to.y}, ${to.x} ${to.y}`;
              return (
                <g key={i}>
                  <motion.path
                    d={d}
                    stroke="url(#edge-grad)"
                    strokeWidth="0.25"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + i * 0.06, duration: 0.6 }}
                  />
                  <motion.circle
                    r="0.5"
                    fill="rgba(168,85,247,0.95)"
                    initial={{ offsetDistance: "0%" }}
                    animate={{ offsetDistance: "100%" }}
                    transition={{
                      duration: 2.4,
                      repeat: Infinity,
                      delay: i * 0.2 + 1,
                      ease: "easeInOut",
                    }}
                    style={{ offsetPath: `path('${d}')` }}
                  />
                </g>
              );
            })}
          </svg>

          {flowNodes.map((n, i) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              style={{
                left: `${n.x}%`,
                top: `${n.y}%`,
                width: n.id === "core" ? "96px" : "112px",
                height: n.id === "core" ? "72px" : "40px",
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2"
            >
              {n.id === "core" ? (
                <motion.div
                  animate={{ boxShadow: ["0 0 30px rgba(168,85,247,0.4)", "0 0 50px rgba(168,85,247,0.7)", "0 0 30px rgba(168,85,247,0.4)"] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  className="w-full h-full rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex flex-col items-center justify-center text-center"
                >
                  <p className="text-white/70 text-[8px] font-mono leading-none">AGENT</p>
                  <p className="text-white text-base font-bold tracking-tight mt-0.5 leading-none">CORE</p>
                  <p className="text-white/70 text-[8px] font-mono mt-1 leading-none">{n.sub}</p>
                </motion.div>
              ) : (
                <div className={`w-full h-full border rounded-lg px-2 flex items-center gap-2 backdrop-blur-sm ${toneStyle[n.tone]}`}>
                  <div className={`w-6 h-6 rounded-md border flex items-center justify-center text-sm shrink-0 bg-black/40 ${toneStyle[n.tone]}`}>
                    {n.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="text-white text-[10px] font-medium leading-tight truncate">{n.label}</p>
                    <p className="text-white/40 text-[8px] font-mono mt-0.5 truncate">{n.sub}</p>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <div className="bg-black/40 border border-white/[0.05] rounded-lg flex flex-col p-3 overflow-hidden min-h-0">
          <div className="flex items-center justify-between mb-2">
            <p className="text-white/65 text-[10px] font-medium">Last 8 runs</p>
            <span className="text-emerald-400 text-[9px] font-mono">▲ 18%</span>
          </div>

          <div className="flex items-end gap-0.5 h-10 mb-3">
            {chartBars.map((h, i) => (
              <motion.div
                key={i}
                animate={{ height: `${h}%` }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="flex-1 bg-gradient-to-t from-violet-500/20 to-violet-400/70 rounded-sm min-h-[2px]"
              />
            ))}
          </div>

          <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <AnimatePresence initial={false} mode="popLayout">
              {runs.map((r) => (
                <motion.div
                  key={r.key}
                  layout
                  initial={{ opacity: 0, y: -8, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: 8, height: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-center gap-2 py-1 border-t border-white/[0.04] first:border-t-0 overflow-hidden"
                >
                  <span className={`w-1 h-1 rounded-full ${statusColor[r.status]}`} />
                  <span className="text-white/65 text-[9px] font-mono">{r.id}</span>
                  <span className="text-white/30 text-[9px] font-mono ml-auto tabular-nums">{r.time}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="border-t border-white/[0.06] px-4 py-1.5 grid grid-cols-4 gap-3 text-[10px] font-mono">
        <span className="text-white/35">runs today <span className="text-white/80 tabular-nums">{runsToday.toLocaleString("en-US")}</span></span>
        <span className="text-white/35">success <span className="text-emerald-400">98.7%</span></span>
        <span className="text-white/35">avg <span className="text-white/80 tabular-nums">{latency}ms</span></span>
        <span className="text-white/35">tokens <span className="text-white/80">4.2M</span></span>
      </div>
    </div>
  );
}

function AIVisual() {
  return (
    <div className="space-y-5">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-15% 0px" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <ScreenFrame title="agents.zaid.ai/flows">
          <AIWorkflow />
        </ScreenFrame>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-15% 0px" }}
        transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      >
        <ScreenFrame title="agents.zaid.ai">
          <AITerminal />
        </ScreenFrame>
      </motion.div>
    </div>
  );
}

function ServiceRow({
  service,
  isActive,
  onClick,
}: {
  service: typeof services[number];
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="relative text-left border-t border-white/[0.1] py-5 last:border-b cursor-pointer group w-full font-inter"
    >
      {isActive && (
        <motion.div
          layoutId="serviceActiveIndicator"
          className="absolute left-[-14px] top-[22px] w-[2px] h-7 rounded-full bg-white"
          transition={{ type: "spring", stiffness: 260, damping: 28 }}
        />
      )}

      <motion.h3
        animate={{
          color: isActive ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.28)",
          x: isActive ? 0 : -2,
          letterSpacing: isActive ? "-0.01em" : "-0.005em",
        }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="text-[22px] md:text-[26px] font-bold tracking-tight leading-[1.15] group-hover:text-white/55"
      >
        {service.title}
      </motion.h3>

      <motion.div
        initial={false}
        animate={{
          height: isActive ? "auto" : 0,
          opacity: isActive ? 1 : 0,
          marginTop: isActive ? 10 : 0,
          filter: isActive ? "blur(0px)" : "blur(2px)",
        }}
        transition={{
          height: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
          opacity: { duration: 0.35, delay: isActive ? 0.1 : 0, ease: [0.22, 1, 0.36, 1] },
          marginTop: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
          filter: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
        }}
        className="overflow-hidden"
      >
        <p className="text-white/60 text-[13.5px] leading-[1.6] max-w-[20rem] font-light tracking-[-0.005em]">
          {service.description}
        </p>
      </motion.div>
    </button>
  );
}

export default function ServicesShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const today = useToday();
  const websitesRef = useRef<HTMLDivElement>(null);
  const saasRef = useRef<HTMLDivElement>(null);
  const aiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const refs = [websitesRef, saasRef, aiRef];
    const observers: IntersectionObserver[] = [];

    refs.forEach((ref, i) => {
      if (!ref.current) return;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveIndex(i);
            }
          });
        },
        { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
      );
      observer.observe(ref.current);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const scrollToVisual = (i: number) => {
    const refs = [websitesRef, saasRef, aiRef];
    refs[i].current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <section id="services" className="relative bg-black">
      <div className="container mx-auto max-w-7xl px-6 sm:px-8 lg:px-10 relative z-10">
        <div className="pt-20 sm:pt-32 lg:pt-40 pb-12 sm:pb-24 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 sm:gap-10 lg:gap-16">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-7">
              <div className="w-8 h-px bg-white/30" />
              <p className="text-[10px] sm:text-xs text-white/50 font-mono tracking-[0.3em] uppercase">
                <span suppressHydrationWarning>{today ?? ""}</span>
                {today ? " — Services" : "Services"}
              </p>
            </div>
            <h2 className="font-walsheim text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight">
              Build, Launch,
              <br />
              <span className="text-white/30">and Automate.</span>
            </h2>
          </div>
          <p className="font-inter text-white/55 text-sm md:text-base max-w-xs leading-[1.7] font-normal lg:pb-2">
            Three pillars. One studio. Everything you need to launch a product, grow it, and put it on autopilot.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[0.55fr_1.55fr] gap-10 lg:gap-14 pb-8">
          <div className="hidden lg:block">
            <div className="sticky top-0 h-screen flex flex-col justify-end pb-[18vh] max-w-sm">
              {services.map((service, i) => (
                <ServiceRow
                  key={service.id}
                  service={service}
                  isActive={i === activeIndex}
                  onClick={() => scrollToVisual(i)}
                />
              ))}
            </div>
          </div>

          <div className="space-y-16 sm:space-y-24 lg:space-y-32">
            <div ref={websitesRef} className="min-h-[55vh] sm:min-h-[80vh] flex flex-col justify-center gap-6 lg:gap-0">
              <MobileServiceHeading index={0} service={services[0]} />
              <div className="w-full">
                <WebsiteVisual />
              </div>
            </div>
            <div ref={saasRef} className="min-h-[55vh] sm:min-h-[80vh] flex flex-col justify-center gap-6 lg:gap-0">
              <MobileServiceHeading index={1} service={services[1]} />
              <div className="w-full">
                <SaaSVisual />
              </div>
            </div>
            <div ref={aiRef} className="min-h-[55vh] sm:min-h-[80vh] flex flex-col justify-center gap-6 lg:gap-0">
              <MobileServiceHeading index={2} service={services[2]} />
              <div className="w-full">
                <AIVisual />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
