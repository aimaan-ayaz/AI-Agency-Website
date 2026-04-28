"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const services = [
  {
    id: "video-ads",
    title: "AI Video Ads",
    desc: "Scroll-stopping videos designed to capture attention and drive clicks, not just views.",
    img: "/service_video_ads_1777393778495.png",
  },
  {
    id: "short-form",
    title: "Short-Form Content Creation",
    desc: "High-volume, platform-optimized content that keeps your brand consistently in front of your audience.",
    img: "/service_short_form_1777393794589.png",
  },
  {
    id: "websites",
    title: "Conversion Websites",
    desc: "Websites built to turn visitors into leads, bookings, or paying customers.",
    img: "/service_websites_1777393810718.png",
  },
  {
    id: "saas",
    title: "SaaS & Web App Development",
    desc: "Scalable products with real functionality — built to launch fast and grow with your business.",
    img: "/service_saas_1777393827121.png",
  },
  {
    id: "copywriting",
    title: "Copywriting",
    desc: "Words engineered to sell, persuade, and move people to take action.",
    img: "/service_copywriting_1777393841424.png",
  },
];

export default function ServicesScrollytelling() {
  return (
    <section id="services" className="relative py-32 px-6 overflow-hidden">
      <div className="container mx-auto max-w-7xl relative z-10">
        
        {/* Minimalist Section Title */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            Our Services
          </h2>
          <div className="w-16 h-1 bg-white/20 mx-auto rounded-full" />
        </motion.div>

        {/* 6-Column Professional Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-8">
          {services.map((service, index) => {
            // All cards span exactly 2 columns so they are mathematically identical in size.
            // To perfectly center the bottom row (which only has 2 cards), we push the 4th card (index 3) 
            // over by 1 column using `md:col-start-2`.
            const isRow2Start = index === 3;

            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
                className={`group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-black/40 backdrop-blur-md hover:border-white/30 transition-all duration-500 hover:shadow-[0_0_40px_rgba(255,255,255,0.05)] md:col-span-2 ${isRow2Start ? "md:col-start-2" : ""}`}
              >
                {/* Image Header */}
                <div className="relative w-full aspect-[4/3] md:aspect-video overflow-hidden border-b border-white/10">
                  <Image
                    src={service.img}
                    alt={service.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  {/* Cinematic gradient overlay fading up from the border */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                </div>

                {/* Text Content */}
                <div className="p-8 md:p-10 flex flex-col flex-grow relative z-10 bg-gradient-to-b from-transparent to-black/50">
                  <h3 className="text-xl md:text-2xl font-bold mb-3 text-white group-hover:text-white/90 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-base md:text-lg text-white/60 leading-relaxed group-hover:text-white/80 transition-colors">
                    {service.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
