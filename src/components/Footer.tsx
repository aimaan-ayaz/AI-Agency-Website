"use client";

export default function Footer() {
  return (
    <footer className="relative bg-black border-t border-white/[0.06]">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="container mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 relative z-10">
        <div className="py-6 sm:py-7 flex flex-col sm:flex-row items-center justify-between gap-4 font-inter">
          <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-[11px] text-white/40 font-mono tracking-[0.18em] uppercase">
            <span>Hazratganj, Lucknow</span>
            <span className="text-white/15">·</span>
            <span className="hidden sm:inline">266003 UP, India</span>
            <span className="hidden sm:inline text-white/15">·</span>
            <span className="text-white/30">26.85°N 80.95°E</span>
          </div>

          <a
            href="https://www.instagram.com/zaid.agencyy"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 text-white/70 hover:text-white text-xs sm:text-sm transition-colors"
          >
            <span className="w-7 h-7 rounded-md border border-white/15 bg-white/[0.04] flex items-center justify-center group-hover:bg-white/10 group-hover:border-white/30 transition-all">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </span>
            <span className="tracking-tight">@zaid.agencyy</span>
          </a>

          <p className="text-[10px] sm:text-[11px] text-white/35 font-mono tracking-[0.2em] uppercase">
            © 2026 Zaid AI Agency
          </p>
        </div>
      </div>
    </footer>
  );
}
