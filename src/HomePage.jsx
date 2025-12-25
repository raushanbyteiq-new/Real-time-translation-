"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useState, useRef } from "react";
import {
  Mic,
  Globe2,
  Sparkles,
  Users,
  ArrowRight,
  Languages,
  Brain,
  Zap,
  MessageSquare,
  FileText,
  Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const navigate = useNavigate();

  const heroY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      setMousePosition({ x: clientX, y: clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const features = [
    {
      icon: Languages,
      title: "Real-time Translation",
      description: "Translate conversations in 100+ languages instantly",
      color: "#2563EB",
      gradient: "from-blue-600 to-cyan-600",
    },
    {
      icon: Mic,
      title: "Live Transcription",
      description: "Crystal-clear transcripts generated in real-time",
      color: "#7C3AED",
      gradient: "from-purple-600 to-pink-600",
    },
    {
      icon: Brain,
      title: "AI Summaries",
      description: "Get intelligent meeting summaries automatically",
      color: "#DB2777",
      gradient: "from-pink-600 to-rose-600",
    },
    {
      icon: Zap,
      title: "Instant Insights",
      description: "Extract key points and action items instantly",
      color: "#059669",
      gradient: "from-green-600 to-emerald-600",
    },
    {
      icon: MessageSquare,
      title: "Smart Annotations",
      description: "Highlight and comment on important moments",
      color: "#D97706",
      gradient: "from-yellow-600 to-orange-600",
    },
    {
      icon: FileText,
      title: "Export Anywhere",
      description: "Share transcripts and summaries seamlessly",
      color: "#6366F1",
      gradient: "from-indigo-600 to-violet-600",
    },
  ];

  const floatingCards = [
    { text: "English", delay: 0, x: -20, y: -30 },
    { text: "हिंदी", delay: 0.2, x: 20, y: -20 },
    { text: "Español", delay: 0.4, x: -30, y: 20 },
    { text: "中文", delay: 0.6, x: 30, y: 30 },
    { text: "العربية", delay: 0.8, x: 0, y: -40 },
  ];

  return (
    <div className="relative bg-[#f5f5f7] text-gray-900 overflow-hidden">
      {/* Dynamic Cursor Gradient */}
      <div
        className="pointer-events-none fixed inset-0 z-50 transition-opacity duration-300"
        style={{
          background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(37, 99, 235, 0.06), transparent 40%)`,
        }}
      />

      {/* Header */}
      <motion.header
        className="fixed top-0 left-0 right-0 z-40 border-b border-gray-300/50 backdrop-blur-xl bg-[#f5f5f7]/90"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe2 className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">MeetFlow</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <button className="text-gray-700 hover:text-gray-900 transition-colors text-sm font-medium">
              Features
            </button>
            <button className="text-gray-700 hover:text-gray-900 transition-colors text-sm font-medium">
              Pricing
            </button>
            <button className="text-gray-700 hover:text-gray-900 transition-colors text-sm font-medium">
              Docs
            </button>
            <button className="px-6 py-2.5 text-sm font-semibold bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors">
              Sign In
            </button>
          </nav>
        </div>
      </motion.header>

      {/* Section 1: Hero */}
      <div className="relative min-h-screen flex items-center justify-center pt-20 bg-gradient-to-b from-[#f5f5f7] via-[#e8eaf0] to-[#f5f5f7]">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage:
              "url(https://raw.createusercontent.com/17ccd2e7-6263-40ba-9c11-110e23ddd563/)",
            backgroundPosition: "center 40%",
          }}
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#f5f5f7]/95 via-[#e8eaf0]/90 to-[#f5f5f7]/95" />

        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-30">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(37, 99, 235, 0.05) 1px, transparent 1px),
                linear-gradient(90deg, rgba(37, 99, 235, 0.05) 1px, transparent 1px)
              `,
              backgroundSize: "80px 80px",
            }}
          />
        </div>

        {/* Floating Gradient Blobs */}
        <motion.div
          className="absolute top-40 left-1/4 w-[600px] h-[600px] rounded-full blur-[140px] opacity-10"
          style={{
            background:
              "radial-gradient(circle, rgba(37, 99, 235, 1) 0%, rgba(124, 58, 237, 0.6) 40%, transparent 70%)",
          }}
          animate={{
            x: [0, 80, -80, 0],
            y: [0, -60, 60, 0],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.div
          className="absolute bottom-40 right-1/4 w-[500px] h-[500px] rounded-full blur-[140px] opacity-10"
          style={{
            background:
              "radial-gradient(circle, rgba(219, 39, 119, 1) 0%, rgba(124, 58, 237, 0.6) 40%, transparent 70%)",
          }}
          animate={{
            x: [0, -60, 80, 0],
            y: [0, 80, -60, 0],
            scale: [1, 0.9, 1.2, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Hero Content */}
        <motion.div
          ref={containerRef}
          className="relative z-10 max-w-4xl mx-auto px-8 text-center"
          style={{ y: heroY, opacity }}
        >
          {/* Floating Language Cards */}
          <div className="absolute inset-0 pointer-events-none">
            {floatingCards.map((card, index) => (
              <motion.div
                key={index}
                className="absolute left-1/2 top-1/2"
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0.4, 0.7, 0.4],
                  scale: [0.9, 1, 0.9],
                  x: [card.x * 10, card.x * 15, card.x * 10],
                  y: [card.y * 10, card.y * 15, card.y * 10],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  delay: card.delay,
                  ease: "easeInOut",
                }}
              >
                <div className="px-4 py-2 rounded-xl bg-white/80 backdrop-blur-xl border border-gray-300/60 text-sm font-semibold shadow-lg text-gray-800">
                  {card.text}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Eyebrow */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 border border-gray-300/70 backdrop-blur-xl mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-xs font-semibold text-gray-800">
              AI-Powered Meeting Intelligence
            </span>
          </motion.div>

          {/* Hero Title */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold leading-[1.1] tracking-tight mb-5 text-gray-900">
              Speak Any Language. Meet Anyone.
            </h1>

            <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
              Real-time translation, AI transcription, and intelligent
              summaries.{" "}
              <span className="text-gray-900 font-semibold">
                Your meetings, understood perfectly.
              </span>
            </p>
          </motion.div>

          {/* CTA */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <motion.button
              className="group relative px-8 py-3.5 text-base font-semibold text-white rounded-full overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)",
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="absolute inset-0 blur-2xl opacity-60"
                style={{
                  background:
                    "linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)",
                }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.6, 0.9, 0.6],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <span className="relative flex items-center gap-2" onClick={()=>{navigate('/meeting')}}>
                Start a Meeting
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </motion.button>

            <motion.button
              className="px-8 py-3.5 text-base font-semibold text-gray-900 rounded-full bg-white border border-gray-300 backdrop-blur-xl hover:bg-gray-50 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Watch Demo
            </motion.button>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-1">100+</div>
              <div className="text-xs font-medium text-gray-600">Languages</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-1">99.9%</div>
              <div className="text-xs font-medium text-gray-600">Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                &lt;1s
              </div>
              <div className="text-xs font-medium text-gray-600">Real-time</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-5 h-8 rounded-full border-2 border-gray-500 flex items-start justify-center p-1.5">
            <motion.div
              className="w-1 h-1 bg-gray-500 rounded-full"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </div>

      {/* Section 2: Features */}
      <div className="relative min-h-screen flex items-center py-20 bg-[#f5f5f7]">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#f5f5f7] via-[#e8eaf0] to-[#f5f5f7]" />

        <div className="relative z-10 max-w-6xl mx-auto px-8 w-full">
          {/* Section Header */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              Everything You Need
            </h2>
            <p className="text-base text-gray-700 max-w-xl mx-auto font-medium">
              Powerful features designed to make every meeting more productive
              and inclusive
            </p>
          </motion.div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="group relative p-6 rounded-2xl bg-white border border-gray-300/60 backdrop-blur-xl hover:border-gray-400/80 hover:shadow-xl transition-all duration-500"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.03, y: -5 }}
              >
                {/* Gradient Background on Hover */}
                <motion.div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`}
                />

                {/* Icon */}
                <div
                  className="inline-flex p-3 rounded-lg mb-4 relative"
                  style={{
                    background: `linear-gradient(135deg, ${feature.color}20, ${feature.color}10)`,
                  }}
                >
                  <feature.icon
                    className="w-6 h-6"
                    style={{ color: feature.color }}
                  />
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover Arrow */}
                <motion.div
                  className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={{ x: -10 }}
                  whileHover={{ x: 0 }}
                >
                  <ArrowRight
                    className="w-4 h-4"
                    style={{ color: feature.color }}
                  />
                </motion.div>
              </motion.div>
            ))}
          </div>

          {/* Bottom CTA */}
          <motion.div
            className="text-center mt-16"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex flex-col sm:flex-row items-center gap-4 px-8 py-6 rounded-2xl bg-white border border-gray-300/70 backdrop-blur-xl shadow-lg">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                <div className="text-left">
                  <div className="text-gray-900 font-bold text-base">
                    10K+ Active Meetings
                  </div>
                  <div className="text-gray-700 text-xs font-medium">
                    Join teams around the world
                  </div>
                </div>
              </div>
              <motion.button
                className="px-6 py-2.5 text-sm font-semibold bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started Free
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}



