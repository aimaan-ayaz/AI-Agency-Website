"use client";

import { motion } from "framer-motion";
import Image from "next/image";

import { useMotionValue, useMotionTemplate } from "framer-motion";

const services = [
  {
    id: "websites",
    title: "Website Creation",
    desc: "We design and build complete websites for your business, whether you need a landing page, portfolio, or full site with payments and bookings. Everything is built to be fast, clear, and ready to bring you customers.",
    img: "/website.png",
    imageClass: "object-[center_20%]",
  },
  {
    id: "saas",
    title: "SaaS Development",
    desc: "Have an idea? We turn it into a real product. We build full SaaS platforms and web apps with login, database, and payments, so your idea is ready for real users, not just a concept.",
    img: "/saas.jpeg",
  },
  {
    id: "short-form",
    title: "Short-Form Content Creation",
    desc: "We produce daily Instagram Reels, TikToks, and Shorts for your brand, fully edited, captioned, and ready to post.",
    img: "/content-creation.jpeg",
  },
  {
    id: "video-ads",
    title: "AI Video Ads",
    desc: "We create ready-to-use ad videos for your product or service using AI actors, scripts, and editing, so you can run ads without filming anything.",
    img: "/ai-ads.jpeg",
  },
  {
    id: "copywriting",
    title: "Copywriting",
    desc: "We write the words for your website, ads, and products so people understand what you offer and take action.",
    img: "/copywriting.jpeg",
  },
];

function ServiceCard({ service, isRow2Start, index }: any) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
      onMouseMove={handleMouseMove}
      className={`group relative flex flex-col overflow-hidden rounded-xl md:rounded-3xl border border-white/10 bg-black/40 backdrop-blur-md hover:border-white/30 transition-all duration-500 hover:shadow-[0_0_40px_rgba(255,255,255,0.05)] col-span-2 ${isRow2Start ? "col-start-2" : ""}`}
    >
      {/* Mouse Tracking Spotlight Gradient */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-xl md:rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100 z-20 hidden md:block"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              600px circle at ${mouseX}px ${mouseY}px,
              rgba(255,255,255,0.08),
              transparent 40%
            )
          `,
        }}
      />
      {/* Image Header */}
      <div className="relative w-full aspect-[4/3] md:aspect-video overflow-hidden border-b border-white/10 z-0">
        <Image
          src={service.img}
          alt={service.title}
          fill
          sizes="(max-width: 768px) 33vw, (max-width: 1200px) 50vw, 33vw"
          className={`object-cover group-hover:scale-105 transition-transform duration-700 ease-out ${service.imageClass || ""}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      </div>

      {/* Text Content */}
      <div className="p-2 sm:p-4 md:p-10 flex flex-col flex-grow relative z-10 bg-gradient-to-b from-transparent to-black/50">
        <h3 className="text-[9px] sm:text-xs md:text-2xl font-bold mb-1 md:mb-3 text-white group-hover:text-white/90 transition-colors leading-tight hover-trigger">
          {service.title}
        </h3>
        <p className="text-[7px] sm:text-[10px] md:text-lg text-white/60 leading-[1.2] md:leading-relaxed group-hover:text-white/80 transition-colors hover-trigger">
          {service.desc}
        </p>
      </div>
    </motion.div>
  );
}

export default function ServicesScrollytelling() {
  return (
    <section id="services" className="relative py-12 md:py-32 px-4 sm:px-6 overflow-hidden">
      <div className="container mx-auto max-w-7xl relative z-10">
        
        {/* Minimalist Section Title */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-10 md:mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 md:mb-6 tracking-tight hover-trigger">
            Our Services
          </h2>
          <div className="w-16 h-1 bg-white/20 mx-auto rounded-full" />
        </motion.div>

        {/* 6-Column Professional Grid Layout (Maintained across all devices) */}
        <div className="grid grid-cols-6 gap-2 sm:gap-4 md:gap-8">
          {services.map((service, index) => {
            const isRow2Start = index === 3;
            return <ServiceCard key={service.id} service={service} isRow2Start={isRow2Start} index={index} />;
          })}
        </div>
      </div>
    </section>
  );
}
