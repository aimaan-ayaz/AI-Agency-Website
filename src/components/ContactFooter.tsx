"use client";

import { useForm, ValidationError } from '@formspree/react';

export default function ContactFooter() {
  const [state, handleSubmit] = useForm('mojygdqk');

  return (
    <section id="contact" className="relative bg-black border-t border-white/10 pt-16 md:pt-32 pb-8">
      <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
        
        {/* Contact Form */}
        <div className="mb-16 md:mb-32">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 md:mb-6 tracking-tight">
              Let's build the future.
            </h2>
            <p className="text-white/60 text-base md:text-lg max-w-2xl mx-auto">
              Ready to scale? Drop your details below and we'll get back to you within 24 hours.
            </p>
          </div>
          
          <div className="relative max-w-2xl mx-auto">
            {/* Background Glow */}
            <div className="absolute inset-0 bg-white/5 blur-[100px] rounded-full pointer-events-none" />
            
            {state.succeeded ? (
              <div className="relative glass-card bg-black/40 backdrop-blur-2xl border border-white/10 p-8 md:p-12 rounded-3xl flex flex-col items-center justify-center gap-6 shadow-[0_0_50px_rgba(0,0,0,0.5)] z-10 min-h-[400px]">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <h3 className="text-3xl font-bold text-white text-center">Message Received</h3>
                <p className="text-white/60 text-center text-lg">Thank you for reaching out. We will get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="relative glass-card bg-black/40 backdrop-blur-2xl border border-white/10 p-8 md:p-12 rounded-3xl flex flex-col gap-6 shadow-[0_0_50px_rgba(0,0,0,0.5)] z-10">
                
                <div className="flex flex-col gap-2">
                  <label htmlFor="name" className="text-sm font-medium text-white/80 ml-2">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="w-full px-6 py-4 text-white bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all placeholder:text-white/30"
                    placeholder="e.g. Julian Anderson"
                    required
                  />
                  <ValidationError prefix="Name" field="name" errors={state.errors} className="text-red-400 text-sm ml-2" />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="text-sm font-medium text-white/80 ml-2">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="w-full px-6 py-4 text-white bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all placeholder:text-white/30"
                    placeholder="julian@visionary.ai"
                    required
                  />
                  <ValidationError prefix="Email" field="email" errors={state.errors} className="text-red-400 text-sm ml-2" />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="phone" className="text-sm font-medium text-white/80 ml-2">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="w-full px-6 py-4 text-white bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all placeholder:text-white/30"
                    placeholder="+1 (415) 867-5309"
                    required
                  />
                  <ValidationError prefix="Phone" field="phone" errors={state.errors} className="text-red-400 text-sm ml-2" />
                </div>

                <button 
                  type="submit" 
                  disabled={state.submitting}
                  className="mt-6 w-full py-5 bg-white text-black text-lg font-bold rounded-2xl hover:bg-white/90 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
                >
                  {state.submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center border-t border-white/10 pt-12 text-sm text-white/60">
          <div className="flex justify-center md:justify-start">
            <a href="https://instagram.com/zaidagainagain" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors p-2 rounded-full border border-white/10 hover:bg-white/10 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </a>
          </div>
          
          <div className="text-center">
            <p>Hazratganj, Lucknow</p>
            <p>266003 UP India</p>
          </div>
          
          <div className="text-center md:text-right font-medium text-white/80">
            <p>I am ready to transform your vision into reality.</p>
          </div>
        </div>

        <div className="mt-16 text-center text-[10px] text-white/40">
          <p>&copy; 2026 ZAID AI Agency. All rights reserved.</p>
        </div>

      </div>
    </section>
  );
}
