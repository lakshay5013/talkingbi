import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function LandingPage({ onStart }) {
  const videoSectionRef = useRef(null);
  const [tilt, setTilt] = useState({ rotateX: 4, rotateY: -10 });

  const handleLearnMore = () => {
    videoSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleMouseMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;

    const rotateY = -14 + px * 18;
    const rotateX = 8 - py * 12;
    setTilt({ rotateX, rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ rotateX: 4, rotateY: -10 });
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f8fafc_0%,#eef2f7_56%,#e9edf5_100%)] px-6 py-12 md:px-10 lg:px-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(148,163,184,0.26),transparent_40%),radial-gradient(circle_at_86%_16%,rgba(99,102,241,0.14),transparent_34%),radial-gradient(circle_at_82%_86%,rgba(71,85,105,0.16),transparent_44%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(112deg,rgba(255,255,255,0.78)_0%,rgba(255,255,255,0.16)_34%,transparent_58%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(160deg,rgba(15,23,42,0.16)_0%,transparent_32%,transparent_70%,rgba(15,23,42,0.12)_100%)]" />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9 }}
        className="pointer-events-none absolute -left-24 top-8 h-96 w-96 rounded-full bg-slate-300/42 blur-3xl"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.1, delay: 0.12 }}
        className="pointer-events-none absolute right-[-90px] top-1/3 h-[26rem] w-[26rem] rounded-full bg-indigo-200/34 blur-3xl"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.15, delay: 0.2 }}
        className="pointer-events-none absolute bottom-[-140px] left-1/3 h-[30rem] w-[30rem] rounded-full bg-slate-200/36 blur-3xl"
      />
      <div className="pointer-events-none absolute left-[34%] top-[-22%] h-[34rem] w-[11rem] rotate-[20deg] bg-white/44 blur-3xl" />
      <div className="pointer-events-none absolute right-[16%] bottom-[-18%] h-[24rem] w-[10rem] -rotate-[18deg] bg-white/32 blur-3xl" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_46%,rgba(2,6,23,0.16)_100%)]" />

      <div className="relative mx-auto grid min-h-[88vh] w-full max-w-7xl grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <motion.div
          initial={{ opacity: 0, x: -32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="max-w-xl"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
            <Sparkles size={14} />
            Talking BI Premium
          </div>

          <h1 className="text-4xl font-black leading-tight tracking-tight text-slate-900 md:text-5xl lg:text-6xl">
            Build Intelligence at the Speed of Thought
          </h1>

          <p className="mt-5 text-lg font-medium leading-relaxed text-slate-600 md:text-xl">
            AI-powered insights from your data instantly
          </p>

          <div className="mt-9 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onStart}
              className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-[0_12px_32px_rgba(37,99,235,0.28)] transition-all duration-300 hover:bg-blue-700"
            >
              Get Started
              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              onClick={handleLearnMore}
              className="inline-flex min-h-12 items-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              Learn More
            </button>
          </div>
        </motion.div>

        <motion.div
          ref={videoSectionRef}
          initial={{ opacity: 0, x: 36 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
          className="relative lg:pl-6"
        >
          <div
            className="[transform-style:preserve-3d] transition-transform duration-300"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
              transform: `perspective(1400px) rotateY(${tilt.rotateY}deg) rotateX(${tilt.rotateX}deg)`,
            }}
          >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 6.5, repeat: Infinity, ease: 'easeInOut' }}
            className="group relative overflow-visible rounded-2xl bg-transparent p-0"
          >
            <div className="pointer-events-none absolute -inset-4 rounded-[28px] bg-[radial-gradient(circle_at_82%_25%,rgba(37,99,235,0.24),transparent_55%)] opacity-80 blur-xl" />
            <div className="pointer-events-none absolute -inset-5 rounded-[30px] bg-[radial-gradient(circle_at_20%_80%,rgba(16,185,129,0.16),transparent_58%)] blur-2xl" />

            <div className="relative overflow-hidden rounded-2xl bg-slate-50 shadow-[0_34px_60px_rgba(15,23,42,0.22)] transition-all duration-500 group-hover:shadow-[0_44px_72px_rgba(15,23,42,0.28)]">
              <video
                src="/AI_Business_Intelligence_Demo_Animation.mp4"
                autoPlay
                muted
                loop
                playsInline
                className="h-[300px] w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] md:h-[380px] lg:h-[430px]"
              />

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-950/22 via-transparent to-blue-900/16" />

              <div className="pointer-events-none absolute left-5 top-[20%] max-w-[74%] rounded-xl bg-white/80 px-4 py-3 shadow-[0_12px_28px_rgba(15,23,42,0.18)] backdrop-blur-md md:left-6 md:max-w-[62%] md:px-5 md:py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-blue-700">Live Product Demo</p>
                <p className="mt-1 text-sm font-semibold leading-snug text-slate-900 md:text-base">
                  Real-time Talking BI workspace with AI chart generation and instant insight cards.
                </p>
              </div>
            </div>

            <div className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_0_30px_rgba(37,99,235,0.10)] transition-all duration-500 group-hover:shadow-[inset_0_0_42px_rgba(37,99,235,0.16)]" />
          </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
