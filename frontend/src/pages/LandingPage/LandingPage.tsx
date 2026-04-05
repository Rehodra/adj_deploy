import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  useInView,
  useScroll,
  useTransform,
} from "framer-motion";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import styles from "./LandingPage.module.scss";

// ─── SVG ICON COMPONENTS ──────────────────────────────────────────────────────
// Each icon is unique — no two share the same path shape

const IconGavel = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="m14 13-7.5 7.5c-.8.8-2.1.8-2.9 0l-1.1-1.1c-.8-.8-.8-2.1 0-2.9L10 9" />
    <path d="m14 6 4 4" /><path d="M21 7 17 3" />
    <path d="m21 7-4-4-2 2 4 4z" /><path d="m17 11 4-4-2-2-4 4z" />
    <path d="M18 12 12 6" />
  </svg>
);

const IconScales = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v18" /><path d="M3 21h18" />
    <path d="M12 6H5l-1 5a5 5 0 0 0 10 0l-1-5" />
    <path d="M12 6h7l1 5a5 5 0 0 1-10 0l1-5" />
  </svg>
);

const IconCitation = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

const IconQuill = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2C10 6.5 8 13 8 13L4 17l4 4 4-4s6.5-2 11-6.5C23 6 22 2 22 2s-4-1-7.5 0z" />
    <path d="M8 13l3.5 3.5" /><path d="M12.5 5.5l5 5" />
  </svg>
);

const IconRiskGraph = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 3 3 21 21 21" />
    <polyline points="3 17 9 11 13 15 21 7" />
    <line x1="21" y1="14" x2="21" y2="7" />
    <line x1="14" y1="7" x2="21" y2="7" />
  </svg>
);

const IconGlobe = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const IconVault = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <circle cx="12" cy="12" r="4" />
    <path d="M12 8v1m0 6v1m4-4h-1M9 12H8" />
    <path d="M15 9l-.7.7M9.7 14.3 9 15M15 15l-.7-.7M9.7 9.7 9 9" />
  </svg>
);

const IconChambers = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconDatabase = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
  </svg>
);

const IconActivity = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const IconShield = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const IconBook = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

const IconCheck = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const IconRocket = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
    <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </svg>
);

const IconArrowRight = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const IconPlay = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <circle cx="12" cy="12" r="10" fill="rgba(255,255,255,0.15)" />
    <polygon points="10,8 16,12 10,16" fill="currentColor" />
  </svg>
);

const IconTrophy = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 9H2V4h4M18 9h4V4h-4M9 14a3 3 0 0 0 6 0V4H9v10zm3 4v2m-3 2h6" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconStar = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
  </svg>
);

const IconBarChart = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="20" x2="12" y2="10" />
    <line x1="18" y1="20" x2="18" y2="4" />
    <line x1="6" y1="20" x2="6" y2="16" />
  </svg>
);

const IconLightning = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <polygon points="13,2 3,14 12,14 11,22 21,10 12,10" />
  </svg>
);

const IconChevronRight = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const IconUpRight = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="7" y1="17" x2="17" y2="7" />
    <polyline points="7 7 17 7 17 17" />
  </svg>
);

// ─── STAT COUNTER ────────────────────────────────────────────────────────────
const StatCounter = ({
  endValue,
  suffix = "",
}: {
  endValue: number;
  suffix?: string;
}) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!inView) return;
    let startTimestamp: number | null = null;
    const duration = 2000;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(ease * endValue));
      if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
  }, [inView, endValue]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};

// ─── FLOATING PARTICLES ───────────────────────────────────────────────────────
const FloatingParticles = () => (
  <div className={styles.particlesContainer} aria-hidden="true">
    {Array.from({ length: 20 }).map((_, i) => (
      <div
        key={i}
        className={styles.particle}
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 7}s`,
          animationDuration: `${5 + Math.random() * 7}s`,
          width: `${2 + Math.random() * 4}px`,
          height: `${2 + Math.random() * 4}px`,
          opacity: 0.12 + Math.random() * 0.28,
        }}
      />
    ))}
  </div>
);

// ─── INDEXING GRID (stat visual) ─────────────────────────────────────────────
const IndexingGrid = () => {
  const [activeNodes, setActiveNodes] = useState<Set<number>>(() => {
    const s = new Set<number>();
    while (s.size < 10) s.add(Math.floor(Math.random() * 45));
    return s;
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveNodes((prev) => {
        const next = new Set(prev);
        const arr = Array.from(next);
        next.delete(arr[Math.floor(Math.random() * arr.length)]);
        let n = Math.floor(Math.random() * 45);
        while (next.has(n)) n = Math.floor(Math.random() * 45);
        next.add(n);
        return next;
      });
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.indexingGridWrapper}>
      <div className={styles.indexingGridSweep} />
      <div className={styles.indexingGrid}>
        {Array.from({ length: 45 }).map((_, i) => (
          <div
            key={i}
            className={`${styles.node} ${activeNodes.has(i) ? styles.nodeActive : ""}`}
          />
        ))}
      </div>
    </div>
  );
};

// ─── LANDING PAGE ─────────────────────────────────────────────────────────────
const LandingPage = () => {
  const { scrollY } = useScroll();
  const heroParallax = useTransform(scrollY, [0, 600], [0, 60]);

  const fadeUp = {
    hidden: { opacity: 0, y: 36 },
    visible: (d = 0) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1], delay: d },
    }),
  };

  const orbFeatures = [
    {
      icon: <IconGavel size={22} />,
      color: "#f87171",
      bg: "rgba(239,68,68,0.12)",
      title: "AI Judge Feedback",
      desc: "Real-time argument evaluation with detailed scoring and precedent references from Indian courts.",
    },
    {
      icon: <IconScales size={22} />,
      color: "#60a5fa",
      bg: "rgba(59,130,246,0.12)",
      title: "Realistic Scenarios",
      desc: "Meticulously crafted Indian courtroom case files with authentic legal nuance and complexity.",
    },
    {
      icon: <IconCitation size={22} />,
      color: "#34d399",
      bg: "rgba(16,185,129,0.12)",
      title: "Citation Mapping",
      desc: "Auto-link arguments to Supreme Court & High Court precedents instantly during your simulation.",
    },
  ];

  const orbBottom = [
    {
      icon: <IconGlobe size={22} />,
      color: "#818cf8",
      bg: "rgba(99,102,241,0.12)",
      title: "Multilingual Support",
      desc: "Hindi, English & all major Indian regional languages fully supported across the platform.",
    },
    {
      icon: <IconVault size={22} />,
      color: "#4ade80",
      bg: "rgba(34,197,94,0.12)",
      title: "Evidence Vault",
      desc: "Encrypted workspace for exhibits, digital evidence management and secure document storage.",
    },
    {
      icon: <IconChambers size={22} />,
      color: "#f472b6",
      bg: "rgba(236,72,153,0.12)",
      title: "Virtual Chambers",
      desc: "Collaborate in real-time mock-trial sessions with peers from across India and beyond.",
    },
  ];

  const stats = [
    {
      span: 2,
      icon: <IconDatabase size={20} />,
      value: 25000,
      suffix: "+",
      label: "Precedents Analyzed",
      sub: "Real-time database covering decades of Supreme Court & High Court jurisprudence.",
      visual: "grid",
    },
    {
      span: 2,
      icon: <IconCheck size={20} />,
      value: 98,
      suffix: "%",
      label: "AI Evaluation Accuracy",
      sub: "Validated by senior legal experts for argument scoring and citation mapping precision.",
      visual: "chart",
    },
    {
      span: 1,
      icon: <IconActivity size={20} />,
      value: 10000,
      suffix: "+",
      label: "Simulations Run",
      sub: "High-stakes practice sessions helping users master courtroom advocacy.",
    },
    {
      span: 1,
      icon: <IconChambers size={20} />,
      value: 2000,
      suffix: "+",
      label: "Law Students",
      sub: "Active learners from top-tier national law universities across India.",
    },
    {
      span: 1,
      icon: <IconShield size={20} />,
      value: 500,
      suffix: "+",
      label: "Legal Professionals",
      sub: "Advocates refining litigation strategies using our AI platform.",
    },
    {
      span: 1,
      icon: <IconBook size={20} />,
      value: 50,
      suffix: "+",
      label: "IPC / CrPC Modules",
      sub: "Training modules covering all major Indian penal and procedural codes.",
    },
  ];

  return (
    <div className={styles.container}>
      <Navbar />

      {/* ══════════════════════════════════════════════════════
          SECTION 1 — HERO   (dark navy)
      ══════════════════════════════════════════════════════ */}
      <section className={styles.heroSection}>
        {/* backgrounds */}
        <div className={styles.heroAurora1} />
        <div className={styles.heroAurora2} />
        <div className={styles.heroAurora3} />
        <div className={styles.heroGrid} />
        <FloatingParticles />

        {/* floating orbs */}
        {[
          { cls: styles.orbA },
          { cls: styles.orbB },
          { cls: styles.orbC },
          { cls: styles.orbD },
          { cls: styles.orbE },
        ].map(({ cls }, i) => (
          <div key={i} className={`${styles.floatingOrb} ${cls}`} />
        ))}

        <motion.div className={styles.heroInner} style={{ y: heroParallax }}>
          {/* ── LEFT CONTENT ── */}
          <div className={styles.heroLeft}>
            <motion.span
              className={styles.heroEyebrow}
              custom={0}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
            >
              <span className={styles.eyebrowPulse} />
              Next-Gen Legal Technology
            </motion.span>

            <motion.h1
              className={styles.heroHeadline}
              custom={0.12}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
            >
              Smart, Transparent &amp;
              <br />
              AI-Powered
              <br />
              <span className={styles.heroAccent}>Courtroom Simulation</span>
            </motion.h1>

            <motion.p
              className={styles.heroDesc}
              custom={0.24}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
            >
              Train, argue, and win with confidence. Adjournment.ai simulates
              real courtroom scenarios using advanced AI—helping law students
              and professionals master legal reasoning, argument structure, and
              evidence-based advocacy.
            </motion.p>

            <motion.div
              className={styles.heroPills}
              custom={0.34}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
            >
              {[
                { dot: "#10b981", text: "Real-time AI Feedback" },
                { dot: "#3b82f6", text: "Indian Case Law" },
                { dot: "#f59e0b", text: "Skill Rankings" },
              ].map((p, i) => (
                <span key={i} className={styles.heroPill}>
                  <span
                    className={styles.pillDot}
                    style={{ background: p.dot, boxShadow: `0 0 8px ${p.dot}` }}
                  />
                  {p.text}
                </span>
              ))}
            </motion.div>

            <motion.div
              className={styles.heroActions}
              custom={0.44}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
            >
              <Link to="/cases">
                <button className={styles.btnPrimary}>
                  <span className={styles.btnShine} />
                  <IconPlay size={18} />
                  Start Simulation
                </button>
              </Link>
              <Link to="/judgementsearch">
                <button className={styles.btnSecondary}>
                  Explore Judgments
                  <IconChevronRight size={16} />
                </button>
              </Link>
            </motion.div>

            <motion.div
              className={styles.heroTrust}
              custom={0.56}
              initial="hidden"
              animate="visible"
              variants={fadeUp}
            >
              <div className={styles.trustLine} />
              <span className={styles.trustLabel}>
                Trusted by 5,000+ Learners &amp; Legal Professionals
              </span>
              <div className={styles.trustItems}>
                <span>⚡ Real Courtroom Scenarios</span>
                <span className={styles.trustSep}>•</span>
                <span>⚖️ AI-Powered Judge</span>
                <span className={styles.trustSep}>•</span>
                <span>📊 Instant Analytics</span>
              </div>
            </motion.div>
          </div>

          {/* ── RIGHT MOCKUP ── */}
          <motion.div
            className={styles.heroRight}
            initial={{ opacity: 0, x: 48 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.2, type: "spring", stiffness: 55, damping: 18 }}
          >
            <div className={styles.mockupGlow} />
            <div className={styles.chatWindow}>
              {/* header */}
              <div className={styles.chatHeader}>
                <div className={styles.trafficLights}>
                  <span className={styles.tlRed} />
                  <span className={styles.tlYellow} />
                  <span className={styles.tlGreen} />
                </div>
                <div className={styles.chatTitle}>
                  <span className={styles.activeDot} />
                  Simulator · State vs. Mehta
                </div>
                <span className={styles.liveBadge}>LIVE</span>
              </div>

              {/* body */}
              <div className={styles.chatBody}>
                <motion.div
                  className={styles.bubbleUser}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.0, duration: 0.5 }}
                >
                  Your Honor, Exhibit A clearly contradicts the witness
                  timeline.
                </motion.div>

                <motion.div
                  className={styles.bubbleAi}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.45, duration: 0.5 }}
                >
                  <div className={styles.bubbleAiHeader}>
                    <span className={styles.aiLabel}>⚖️ AI JUDGE FEEDBACK</span>
                    <span className={styles.verdictBadge}>✓ Good Reasoning</span>
                  </div>
                  <div className={styles.bubbleAiText}>
                    Valid point. However, cite the relevant section of the
                    Evidence Act to substantiate this claim before proceeding.
                  </div>
                </motion.div>

                <motion.div
                  className={styles.typingDots}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 2.1, duration: 0.4 }}
                >
                  <span /><span /><span />
                </motion.div>
              </div>

              {/* metrics footer */}
              <div className={styles.chatMetrics}>
                <div className={styles.metricsTitle}>
                  <span className={styles.metricsDot} />
                  LIVE PERFORMANCE
                </div>
                {[
                  { name: "Legal Accuracy", pct: "78%", cls: styles.fillBlue },
                  { name: "Evidence Usage", pct: "92%", cls: styles.fillGreen },
                  { name: "Argument Flow", pct: "85%", cls: styles.fillAmber },
                ].map(({ name, pct, cls }, i) => (
                  <div key={i} className={styles.metricRow}>
                    <span className={styles.metricName}>{name}</span>
                    <div className={styles.metricBar}>
                      <motion.div
                        className={`${styles.metricFill} ${cls}`}
                        style={{ width: pct }}
                        initial={{ width: 0 }}
                        animate={{ width: pct }}
                        transition={{ delay: 1.2 + i * 0.3, duration: 1.3, ease: "easeOut" }}
                      />
                    </div>
                    <span className={styles.metricVal}>{pct}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* floating badges */}
            <motion.div
              className={styles.floatBadge1}
              animate={{ y: [0, -9, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <IconTrophy size={15} />
              <span>Rank #7 This Week</span>
            </motion.div>
            <motion.div
              className={styles.floatBadge2}
              animate={{ y: [0, 9, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            >
              🔥 <span>5 Day Streak</span>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 2 — GET STARTED   (white / light-blue)
      ══════════════════════════════════════════════════════ */}
      <section className={styles.gsSection}>
        <div className={styles.gsBgDots} />
        <div className={styles.gsBgBlob1} />
        <div className={styles.gsBgBlob2} />

        <div className={styles.gsInner}>
          <motion.div
            className={styles.gsBadgeRow}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
          >
            <span className={styles.gsBadge}>
              <IconRocket size={15} />
              Your Legal Career Starts Here
            </span>
          </motion.div>

          <motion.h2
            className={styles.gsHeadline}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0.1}
          >
            The Courtroom Awaits.
            <br />
            <span className={styles.gsHeadlineAccent}>Are You Ready to Win?</span>
          </motion.h2>

          <motion.p
            className={styles.gsSub}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0.2}
          >
            Join thousands of law students and legal professionals who are
            sharpening their skills, winning simulations, and building the
            confidence to dominate in real courtrooms.
          </motion.p>

          {/* Benefits */}
          <motion.div
            className={styles.gsBenefits}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0.28}
          >
            {[
              { icon: "🏅", bg: "#eff6ff", text: "AI-Certified Practice" },
              { icon: "📈", bg: "#f0fdf4", text: "Track Your Growth" },
              { icon: "👥", bg: "#fff7ed", text: "Community of 5,000+" },
              { icon: "💼", bg: "#eff6ff", text: "Real Case Scenarios" },
              { icon: "📚", bg: "#fdf4ff", text: "50+ Legal Modules" },
              { icon: "🌐", bg: "#f0fdfa", text: "Multilingual Support" },
            ].map((b, i) => (
              <motion.div
                key={i}
                className={styles.gsBenefit}
                whileHover={{ y: -3, transition: { duration: 0.15 } }}
              >
                <span
                  className={styles.benefitIcon}
                  style={{ background: b.bg }}
                >
                  {b.icon}
                </span>
                {b.text}
              </motion.div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div
            className={styles.gsCtaWrapper}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0.36}
          >
            <div className={styles.gsCtaGlow} />
            <Link to="/cases">
              <motion.button
                className={styles.gsBtn}
                whileHover={{
                  scale: 1.04,
                  boxShadow:
                    "0 0 80px rgba(59,130,246,0.45), 0 24px 60px rgba(37,99,235,0.35)",
                  transition: { duration: 0.2 },
                }}
                whileTap={{ scale: 0.97 }}
              >
                <span className={styles.gsBtnShine} />
                <span className={styles.gsBtnIconWrap}>
                  <IconRocket size={26} />
                </span>
                <span>Get Started — It's Free</span>
                <span className={styles.gsBtnArrow}>
                  <IconUpRight size={20} />
                </span>
              </motion.button>
            </Link>
            <p className={styles.gsHint}>
              🛡️ No credit card required · Free forever for students
            </p>
          </motion.div>

          {/* Avatars */}
          <motion.div
            className={styles.gsAvatarRow}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0.44}
          >
            <div className={styles.gsAvatars}>
              {["S", "R", "P", "A", "K"].map((l, i) => (
                <div
                  key={i}
                  className={styles.gsAvatar}
                  style={{
                    background: `hsl(${200 + i * 28}, 68%, 54%)`,
                    marginLeft: i > 0 ? -10 : 0,
                    zIndex: 5 - i,
                  }}
                >
                  {l}
                </div>
              ))}
            </div>
            <div className={styles.gsAvatarText}>
              <div className={styles.gsStars}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <IconStar key={i} size={12} />
                ))}
              </div>
              <span>
                Loved by <strong>5,000+</strong> legal professionals
              </span>
            </div>
          </motion.div>

          {/* Mini feature cards */}
          <motion.div
            className={styles.gsCards}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0.5}
          >
            {[
              {
                icon: <IconGavel size={20} />,
                iconBg: "#fffbeb",
                iconColor: "#b45309",
                tag: "Most Popular",
                tagColor: "#b45309",
                tagBorder: "#fcd34d",
                accent: "linear-gradient(90deg,#f59e0b,#fcd34d)",
                title: "Start a Case",
                desc: "Pick from 100+ real Indian court scenarios and argue your position with live AI feedback.",
              },
              {
                icon: <IconBarChart size={20} />,
                iconBg: "#eff6ff",
                iconColor: "#1d4ed8",
                tag: "AI-Powered",
                tagColor: "#1d4ed8",
                tagBorder: "#93c5fd",
                accent: "linear-gradient(90deg,#3b82f6,#06b6d4)",
                title: "Track Progress",
                desc: "See your skill growth across argument clarity, evidence usage, and legal reasoning.",
              },
              {
                icon: <IconTrophy size={20} />,
                iconBg: "#f0fdf4",
                iconColor: "#065f46",
                tag: "Competitive",
                tagColor: "#065f46",
                tagBorder: "#6ee7b7",
                accent: "linear-gradient(90deg,#10b981,#34d399)",
                title: "Climb Rankings",
                desc: "Compete on the leaderboard and earn certifications for your hard-won achievements.",
              },
            ].map((c, i) => (
              <motion.div
                key={i}
                className={styles.gsCard}
                style={{ "--card-accent": c.accent } as React.CSSProperties}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
              >
                <div
                  className={styles.gsCardIcon}
                  style={{ background: c.iconBg, color: c.iconColor }}
                >
                  {c.icon}
                </div>
                <span
                  className={styles.gsCardTag}
                  style={{ color: c.tagColor, borderColor: c.tagBorder }}
                >
                  {c.tag}
                </span>
                <h4>{c.title}</h4>
                <p>{c.desc}</p>
                <div className={styles.gsCardArrow}>
                  <IconArrowRight size={15} />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 3 — FEATURES   (dark navy)
      ══════════════════════════════════════════════════════ */}
      <section className={styles.featSection}>
        <div className={styles.featMesh} />
        <div className={styles.featGlow} />

        <div className={styles.featInner}>
          <motion.div
            className={styles.sectionHeader}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
          >
            <span className={styles.badgeDark}>Platform Capabilities</span>
            <h2>
              Engineered for{" "}
              <em className={styles.headlineItalic}>Legal Excellence</em>
            </h2>
            <p>
              Our platform combines cutting-edge AI with rigorous legal standards
              to provide an unparalleled courtroom simulation experience.
            </p>
          </motion.div>

          <div className={styles.orbLayout}>
            {/* top row */}
            <div className={styles.orbRow}>
              {orbFeatures.map((f, i) => (
                <motion.div
                  key={i}
                  className={styles.orbCard}
                  style={
                    { "--oc": f.color, "--oc-bg": f.bg } as React.CSSProperties
                  }
                  initial={{ opacity: 0, y: -20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                >
                  <div className={styles.orbCardIcon}>{f.icon}</div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                  <div className={styles.orbCardArrow}>
                    <IconArrowRight size={13} />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* middle row with center orb */}
            <div className={styles.orbMiddle}>
              {[
                {
                  icon: <IconQuill size={22} />,
                  color: "#c084fc",
                  bg: "rgba(147,51,234,0.12)",
                  title: "Drafting AI",
                  desc: "Generate petitions & pleadings for authentic Indian legal formats and standards.",
                },
              ].map((f, i) => (
                <motion.div
                  key={i}
                  className={styles.orbCard}
                  style={
                    { "--oc": f.color, "--oc-bg": f.bg } as React.CSSProperties
                  }
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                >
                  <div className={styles.orbCardIcon}>{f.icon}</div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                  <div className={styles.orbCardArrow}>
                    <IconArrowRight size={13} />
                  </div>
                </motion.div>
              ))}

              {/* Center icon */}
              <motion.div
                className={styles.orbCenter}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, type: "spring", stiffness: 60 }}
              >
                <div className={styles.orbCenterGlow} />
                <motion.div
                  className={styles.orbCenterIcon}
                  animate={{ y: [0, -10, 0], scale: [1, 1.03, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  ⚖️
                </motion.div>
                <div className={styles.orbRing1} />
                <div className={styles.orbRing2} />
              </motion.div>

              {[
                {
                  icon: <IconRiskGraph size={22} />,
                  color: "#fb923c",
                  bg: "rgba(249,115,22,0.12)",
                  title: "Risk Analysis",
                  desc: "Predict case outcome probability using historical data AI modeling and pattern recognition.",
                },
              ].map((f, i) => (
                <motion.div
                  key={i}
                  className={styles.orbCard}
                  style={
                    { "--oc": f.color, "--oc-bg": f.bg } as React.CSSProperties
                  }
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                >
                  <div className={styles.orbCardIcon}>{f.icon}</div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                  <div className={styles.orbCardArrow}>
                    <IconArrowRight size={13} />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* bottom row */}
            <div className={styles.orbRow}>
              {orbBottom.map((f, i) => (
                <motion.div
                  key={i}
                  className={styles.orbCard}
                  style={
                    { "--oc": f.color, "--oc-bg": f.bg } as React.CSSProperties
                  }
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                >
                  <div className={styles.orbCardIcon}>{f.icon}</div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                  <div className={styles.orbCardArrow}>
                    <IconArrowRight size={13} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SECTION 4 — STATS / CREDIBILITY   (white / light-blue)
      ══════════════════════════════════════════════════════ */}
      <section className={styles.statsSection}>
        <div className={styles.statsBgGlow} />
        <div className={styles.statsBgGrid} />

        <div className={styles.statsInner}>
          <motion.div
            className={styles.statsHeader}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
          >
            <span className={styles.badgeLight}>Platform Performance</span>
            <h2>
              Data-Driven Credibility.
              <br />
              <span className={styles.statsGrad}>Proven at Scale.</span>
            </h2>
            <p>
              Built for the modern legal professional, validated across thousands
              of real-world courtroom scenarios across India.
            </p>
          </motion.div>

          <div className={styles.statsGrid}>
            {stats.map((s, i) => (
              <motion.div
                key={i}
                className={`${styles.statCard} ${s.span === 2 ? styles.span2 : ""}`}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ delay: i * 0.08, duration: 0.65, ease: "easeOut" }}
              >
                <div className={styles.statBgDots} />
                <div className={styles.statContent}>
                  <div className={styles.statIconWrap}>{s.icon}</div>
                  <h4 className={styles.statNumber}>
                    <StatCounter endValue={s.value} suffix={s.suffix} />
                  </h4>
                  <span className={styles.statLabel}>{s.label}</span>
                  <span className={styles.statSub}>{s.sub}</span>
                </div>

                {s.visual === "grid" && (
                  <div className={styles.visualWrap}>
                    <IndexingGrid />
                  </div>
                )}

                {s.visual === "chart" && (
                  <div className={styles.visualWrap}>
                    <div className={styles.chartWrap}>
                      <span className={styles.benchLabel}>Human Avg (85%)</span>
                      <svg
                        viewBox="0 0 100 40"
                        className={styles.chartSvg}
                        preserveAspectRatio="none"
                      >
                        <defs>
                          <linearGradient
                            id="chartGrad"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor="rgba(59,130,246,0.4)"
                            />
                            <stop
                              offset="100%"
                              stopColor="rgba(59,130,246,0)"
                            />
                          </linearGradient>
                        </defs>
                        <line
                          x1="0" y1="22" x2="100" y2="22"
                          stroke="#94a3b8"
                          strokeDasharray="2,2"
                          strokeWidth="0.5"
                        />
                        <path
                          d="M0,26 C35,26 58,5 96,3 L96,40 L0,40 Z"
                          fill="url(#chartGrad)"
                          stroke="none"
                        />
                        <motion.path
                          d="M0,26 C35,26 58,5 96,3"
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          initial={{ pathLength: 0 }}
                          whileInView={{ pathLength: 1 }}
                          viewport={{ once: true }}
                          transition={{
                            duration: 1.8,
                            delay: 0.4,
                            ease: [0.4, 0, 0.2, 1],
                          }}
                        />
                        <motion.circle
                          cx="96" cy="3" r="2.5" fill="#3b82f6"
                          initial={{ scale: 0, opacity: 0 }}
                          whileInView={{ scale: [1, 1.5, 1], opacity: [0.8, 1, 0.8] }}
                          viewport={{ once: true }}
                          transition={{ delay: 1.8, duration: 2, repeat: Infinity }}
                        />
                        <motion.circle
                          cx="96" cy="3" r="6"
                          fill="rgba(59,130,246,0.3)"
                          initial={{ scale: 0, opacity: 0 }}
                          whileInView={{ scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] }}
                          viewport={{ once: true }}
                          transition={{ delay: 1.8, duration: 2, repeat: Infinity }}
                        />
                      </svg>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          <motion.div
            className={styles.credStrip}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <div className={styles.credLine} />
            <span className={styles.credText}>
              Trusted by law students, advocates, and legal educators across India
            </span>
            <div className={styles.credLine} />
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;