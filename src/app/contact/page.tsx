"use client";

import { useForm, ValidationError } from "@formspree/react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function ContactPage() {
  const [state, handleSubmit] = useForm("mojygdqk");

  return (
    <main className="relative bg-black min-h-screen overflow-hidden flex items-center">
      <div className="absolute top-[20%] -right-40 w-[600px] h-[600px] rounded-full bg-violet-500/[0.05] blur-3xl pointer-events-none" />
      <div className="absolute bottom-[10%] -left-40 w-[600px] h-[600px] rounded-full bg-emerald-500/[0.04] blur-3xl pointer-events-none" />

      <div className="container mx-auto max-w-3xl px-6 sm:px-8 py-24 lg:py-32 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/45 hover:text-white text-xs font-mono tracking-[0.25em] uppercase transition-colors mb-10 font-inter"
          >
            <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M7.5 3 4.5 6l3 3" />
            </svg>
            Back
          </Link>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-px bg-white/30" />
            <p className="text-[10px] sm:text-xs text-white/50 font-mono tracking-[0.3em] uppercase">
              Contact · Let&apos;s Build
            </p>
          </div>

          <h1 className="font-walsheim text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-[1.05] tracking-tight mb-5">
            Let&apos;s build the future.
          </h1>
          <p className="text-white/55 text-base md:text-lg max-w-xl leading-relaxed mb-12 font-inter font-light">
            Ready to scale? Drop your details below and we will get back to you within 24 hours.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div className="absolute inset-0 bg-white/[0.03] blur-[80px] rounded-full pointer-events-none" />

          {state.succeeded ? (
            <div className="relative bg-black/40 backdrop-blur-2xl border border-white/[0.08] p-8 md:p-12 rounded-3xl flex flex-col items-center justify-center gap-6 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] z-10 min-h-[400px]">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 18 }}
                className="w-16 h-16 bg-emerald-500/10 border border-emerald-400/20 rounded-full flex items-center justify-center mb-4"
              >
                <svg className="w-7 h-7 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              </motion.div>
              <h3 className="font-walsheim text-2xl md:text-3xl font-bold text-white text-center">Message received.</h3>
              <p className="text-white/55 text-center text-sm md:text-base max-w-md font-inter font-light">
                Thanks for reaching out. We will get back to you within 24 hours.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="relative bg-black/40 backdrop-blur-2xl border border-white/[0.08] p-7 md:p-10 rounded-3xl flex flex-col gap-5 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] z-10 font-inter"
            >
              <div className="flex flex-col gap-2">
                <label htmlFor="name" className="text-[10px] uppercase tracking-[0.25em] font-medium text-white/55 ml-1">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="w-full px-5 py-3.5 text-white bg-white/[0.03] border border-white/[0.08] rounded-xl focus:outline-none focus:border-white/30 focus:bg-white/[0.06] transition-all placeholder:text-white/25"
                  placeholder="e.g. Julian Anderson"
                  required
                />
                <ValidationError prefix="Name" field="name" errors={state.errors} className="text-rose-400 text-xs ml-1" />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-[10px] uppercase tracking-[0.25em] font-medium text-white/55 ml-1">Email Address</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full px-5 py-3.5 text-white bg-white/[0.03] border border-white/[0.08] rounded-xl focus:outline-none focus:border-white/30 focus:bg-white/[0.06] transition-all placeholder:text-white/25"
                  placeholder="julian@visionary.ai"
                  required
                />
                <ValidationError prefix="Email" field="email" errors={state.errors} className="text-rose-400 text-xs ml-1" />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="phone" className="text-[10px] uppercase tracking-[0.25em] font-medium text-white/55 ml-1">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="w-full px-5 py-3.5 text-white bg-white/[0.03] border border-white/[0.08] rounded-xl focus:outline-none focus:border-white/30 focus:bg-white/[0.06] transition-all placeholder:text-white/25"
                  placeholder="+1 (415) 867 5309"
                  required
                />
                <ValidationError prefix="Phone" field="phone" errors={state.errors} className="text-rose-400 text-xs ml-1" />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="message" className="text-[10px] uppercase tracking-[0.25em] font-medium text-white/55 ml-1">What are we building?</label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  className="w-full px-5 py-3.5 text-white bg-white/[0.03] border border-white/[0.08] rounded-xl focus:outline-none focus:border-white/30 focus:bg-white/[0.06] transition-all placeholder:text-white/25 resize-none"
                  placeholder="A premium website, a SaaS platform, an AI workflow..."
                />
                <ValidationError prefix="Message" field="message" errors={state.errors} className="text-rose-400 text-xs ml-1" />
              </div>

              <button
                type="submit"
                disabled={state.submitting}
                className="mt-4 w-full py-4 bg-white text-black text-sm font-bold rounded-xl hover:bg-white/95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.08)] hover:shadow-[0_0_40px_rgba(255,255,255,0.18)] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed tracking-tight"
              >
                {state.submitting ? "Submitting..." : "Send Request →"}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </main>
  );
}
