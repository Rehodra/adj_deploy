import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useInView, useScroll, useTransform } from "framer-motion";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import styles from "./LandingPage.module.scss";
import {
  BsShieldFill,
  BsGraphUpArrow,
  BsStarFill,
  BsLightningChargeFill,
  BsArrowRight,
  BsPlayCircleFill,
  BsCheckCircleFill,
  BsTrophyFill,
  BsRocketTakeoffFill,
  BsAwardFill,
  BsBarChartFill,
  BsPeopleFill,
  BsBriefcaseFill,
  BsBookFill,
  BsGlobeCentralSouthAsia,
  BsGem,
  
  
  BsChatQuoteFill,
  BsArrowUpRightCircleFill,
  BsChevronRight,
} from "react-icons/bs";

// Stable Lottie component using @dotlottie/player web component
const LottieAnimation = ({ src }: { src: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    import('@dotlottie/player-component').then(() => {
      if (containerRef.current) {
        containerRef.current.innerHTML = `
          <dotlottie-player
            src="${src}"
            autoplay
            loop
            style="width:100%;height:100%"
          ></dotlottie-player>
        `;
      }
    }).catch(() => {});
    return () => {
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, [src]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%', minHeight: '340px' }} />;
};

// Keep all original SVG icons
const IconShield = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
);
const IconBookOpen = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
);
const IconClock = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);
const IconArrowRight = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
);
const IconCheckCircle = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
);
const IconDatabase = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>
);
const IconActivity = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
);
const IconScales = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v18" /><path d="M3 21h18" />
    <path d="M12 6H5l-1 5a5 5 0 0 0 10 0l-1-5" />
    <path d="M12 6h7l1 5a5 5 0 0 1-10 0l1-5" />
  </svg>
);
const IconGavel = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m14 13-7.5 7.5c-.8.8-2.1.8-2.9 0l-1.1-1.1c-.8-.8-.8-2.1 0-2.9L10 9" />
    <path d="m14 6 4 4" /><path d="M21 7 17 3" />
    <path d="m21 7-4-4-2 2 4 4z" /><path d="m17 11 4-4-2-2-4 4z" />
    <path d="M18 12 12 6" />
  </svg>
);
const IconLandmark = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 22h18" /><path d="M6 18v-7" /><path d="M10 18v-7" />
    <path d="M14 18v-7" /><path d="M18 18v-7" /><path d="M12 2l8 5H4z" />
  </svg>
);
const IconChevronLeft = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
);
const IconQuill = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2C10 6.5 8 13 8 13L4 17l4 4 4-4s6.5-2 11-6.5C23 6 22 2 22 2s-4-1-7.5 0z" />
    <path d="M8 13l3.5 3.5" /><path d="M12.5 5.5l5 5" />
  </svg>
);
const IconLink = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);
const IconGlobe = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);
const IconGraph = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 3 3 21 21 21" /><polyline points="3 17 9 11 13 15 21 7" />
    <line x1="21" y1="14" x2="21" y2="7" /><line x1="14" y1="7" x2="21" y2="7" />
  </svg>
);
const IconSafe = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const IconUsers = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const StatCounter = ({ endValue, suffix = '' }: { endValue: number, suffix?: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  useEffect(() => {
    if (inView) {
      let startTimestamp: number;
      const duration = 2000;
      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 4);
        setCount(Math.floor(ease * endValue));
        if (progress < 1) window.requestAnimationFrame(step);
      };
      window.requestAnimationFrame(step);
    }
  }, [inView, endValue]);
  return <span ref={ref}>{count}{suffix}</span>;
};

// Floating particle component
const FloatingParticles = () => (
  <div className={styles.particlesContainer}>
    {Array.from({ length: 18 }).map((_, i) => (
      <div key={i} className={styles.particle} style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        animationDelay: `${Math.random() * 6}s`,
        animationDuration: `${4 + Math.random() * 6}s`,
        width: `${2 + Math.random() * 4}px`,
        height: `${2 + Math.random() * 4}px`,
        opacity: 0.15 + Math.random() * 0.3,
      }} />
    ))}
  </div>
);

const LandingPage = () => {
  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, [0, 800], [0, 100]);
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
  };

  return (
    <div className={styles.container}>
      <Navbar />

      {/* ══════════════════════════════════════
          HERO SECTION — WHITE THEME (Section 1)
      ══════════════════════════════════════ */}
      <section className={styles.heroSection}>
        <div className={styles.blobTopLeft} />
        <div className={styles.blobBottomRight} />
        <div className={styles.gridTexture} />
        <FloatingParticles />

        <div className={styles.heroInner}>
          {/* LEFT: TEXT CONTENT */}
          <motion.div
            className={styles.heroContent}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <motion.span
              className={styles.eyebrowBadge}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
            >
              <BsLightningChargeFill style={{ marginRight: 6, color: '#f59e0b' }} />
              NEXT-GEN LEGAL TECHNOLOGY
            </motion.span>

            <motion.h1
              className={styles.heroHeadline}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.75, ease: 'easeOut' }}
            >
              Smart, Transparent &amp; <br />
              AI-Powered <br />
              <span className={styles.solidBlueText}>Courtroom Simulation</span>
            </motion.h1>

            <motion.div
              className={styles.heroDesc}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.7 }}
            >
              <p>
                Train, argue, and win with confidence. Adjournment.ai simulates real courtroom scenarios using advanced AI—helping law students and professionals master legal reasoning, argument structure, and evidence-based advocacy.
              </p>
              <p>
                Built for aspiring lawyers, law students, and legal professionals preparing for real-world litigation.
              </p>
            </motion.div>

            {/* Feature pills */}
            <motion.div
              className={styles.heroPills}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.42, duration: 0.6 }}
            >
              {[
                { icon: <BsCheckCircleFill />, text: 'Real-time AI Feedback', color: '#10b981' },
                { icon: <BsShieldFill />, text: 'Indian Case Law', color: '#3b82f6' },
                { icon: <BsTrophyFill />, text: 'Skill Rankings', color: '#f59e0b' },
              ].map((pill, i) => (
                <span key={i} className={styles.heroPill} style={{ '--pill-color': pill.color } as React.CSSProperties}>
                  <span style={{ color: pill.color }}>{pill.icon}</span>
                  {pill.text}
                </span>
              ))}
            </motion.div>

            <motion.div
              className={styles.heroActions}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7 }}
            >
              <Link to="/cases">
                <button className={styles.btnPrimary}>
                  <BsPlayCircleFill style={{ marginRight: 8 }} />
                  Start Simulation
                  <span className={styles.btnShine} />
                </button>
              </Link>
              <Link to="/judgementsearch">
                <button className={styles.btnSecondary}>
                  Explore Judgments
                  <BsChevronRight style={{ marginLeft: 6 }} />
                </button>
              </Link>
            </motion.div>

            <motion.div
              className={styles.socialProof}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.75, duration: 0.8 }}
            >
              <div className={styles.socialProofDivider} />
              <span className={styles.trustedLabel}>TRUSTED BY 5,000+ LEARNERS AND LEGAL PROFESSIONALS</span>
              <div className={styles.trustedDots}>
                <span>Real Courtroom Scenarios</span>
                <span className={styles.dotSeparator}>•</span>
                <span>AI-Powered Judge Feedback</span>
                <span className={styles.dotSeparator}>•</span>
                <span>Instant Performance Analysis</span>
              </div>
            </motion.div>
          </motion.div>

          {/* RIGHT: CHAT MOCKUP */}
          <motion.div
            className={styles.heroVisual}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 1, type: 'spring', stiffness: 55, damping: 18 }}
          >
            <div className={styles.mockupGlow} />
            <div className={styles.chatMockupContainer}>
              <div className={styles.chatMockupWindow}>
                <div className={styles.mockupHeader}>
                  <div className={styles.mockupTrafficLights}>
                    <span className={styles.lightRed} />
                    <span className={styles.lightYellow} />
                    <span className={styles.lightGreen} />
                  </div>
                  <div className={styles.mockupHeaderText}>
                    <span className={styles.mockupDot} />
                    Simulator • State vs. Mehta
                  </div>
                  <div className={styles.mockupLiveBadge}>LIVE</div>
                </div>

                <div className={styles.mockupChatBody}>
                  <motion.div
                    className={styles.userBubble}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.0, duration: 0.5 }}
                  >
                    Your Honor, Exhibit A clearly contradicts the witness timeline.
                  </motion.div>

                  <motion.div
                    className={styles.aiBubble}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.4, duration: 0.5 }}
                  >
                    <div className={styles.aiBubbleHeader}>
                      <span className={styles.aiLabel}>⚖️ AI Judge Feedback</span>
                      <span className={styles.feedbackBadge}>
                        <BsCheckCircleFill style={{ marginRight: 4 }} />
                        Good Reasoning
                      </span>
                    </div>
                    <div className={styles.aiBubbleText}>
                      Valid point. However, cite the relevant section of the Evidence Act to substantiate this claim.
                    </div>
                  </motion.div>

                  <motion.div
                    className={styles.typingIndicator}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.0, duration: 0.4 }}
                  >
                    <span /><span /><span />
                  </motion.div>
                </div>

                <div className={styles.mockupFooter}>
                  <div className={styles.mockupScoreHeader}>
                    <BsBarChartFill style={{ color: '#3b82f6', marginRight: 6 }} />
                    Live Performance
                  </div>
                  <div className={styles.mockupStatRow}>
                    <span className={styles.statLabel}>Legal Accuracy</span>
                    <div className={styles.mockupProgressBar}>
                      <motion.div
                        className={styles.progressFillBlue}
                        initial={{ width: 0 }}
                        animate={{ width: '78%' }}
                        transition={{ delay: 1.2, duration: 1.2, ease: 'easeOut' }}
                      />
                    </div>
                    <span className={styles.statValue}>78%</span>
                  </div>
                  <div className={styles.mockupStatRow}>
                    <span className={styles.statLabel}>Evidence Usage</span>
                    <div className={styles.mockupProgressBar}>
                      <motion.div
                        className={styles.progressFillGreen}
                        initial={{ width: 0 }}
                        animate={{ width: '92%' }}
                        transition={{ delay: 1.5, duration: 1.2, ease: 'easeOut' }}
                      />
                    </div>
                    <span className={styles.statValue}>92%</span>
                  </div>
                  <div className={styles.mockupStatRow}>
                    <span className={styles.statLabel}>Argument Flow</span>
                    <div className={styles.mockupProgressBar}>
                      <motion.div
                        className={styles.progressFillAmber}
                        initial={{ width: 0 }}
                        animate={{ width: '85%' }}
                        transition={{ delay: 1.8, duration: 1.2, ease: 'easeOut' }}
                      />
                    </div>
                    <span className={styles.statValue}>85%</span>
                  </div>
                </div>
              </div>

              {/* Floating badges */}
              <motion.div
                className={styles.floatingBadge1}
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <BsTrophyFill style={{ color: '#f59e0b' }} />
                <span>Rank #7 This Week</span>
              </motion.div>

              <motion.div
                className={styles.floatingBadge2}
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              >
               
                <span>5 Day Streak 🔥</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FEATURES SECTION — BLUE DARK THEME (Section 2)
      ══════════════════════════════════════ */}
      <section className={styles.featuresSection}>
        <div className={styles.featuresBlob} />
        <div className={styles.featuresGrid} />

        <div className={styles.featuresInner}>
          <motion.div
            className={styles.sectionHeader}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className={styles.sectionBadge}>Platform Capabilities</span>
            <h2>Engineered for <span className={styles.featureGradient}>Legal Excellence</span></h2>
            <p>Our platform combines cutting-edge AI with rigorous legal standards to provide an unparalleled courtroom simulation experience.</p>
          </motion.div>

          <div className={styles.orbitalLayout}>
            <div className={styles.orbitalTop}>
              {[
                { icon: <IconGavel size={22} />, color: '#f87171', bg: 'rgba(239,68,68,0.15)', title: 'AI Judge Feedback', desc: 'Real-time argument evaluation with detailed scoring and precedent references.' },
                { icon: <IconScales size={22} />, color: '#60a5fa', bg: 'rgba(59,130,246,0.15)', title: 'Realistic Scenarios', desc: 'Meticulously crafted Indian courtroom case files with real legal nuance.' },
                { icon: <IconLink size={22} />, color: '#34d399', bg: 'rgba(16,185,129,0.15)', title: 'Citation Mapping', desc: 'Auto-link arguments to Supreme Court & High Court precedents instantly.' },
              ].map((f, i) => (
                <motion.div
                  key={i}
                  className={styles.orbCard}
                  style={{ '--orb-color': f.color, '--orb-bg': f.bg } as React.CSSProperties}
                  initial={{ opacity: 0, y: -20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  onHoverStart={() => setHoveredFeature(i)}
                  onHoverEnd={() => setHoveredFeature(null)}
                >
                  <div className={styles.orbCardIcon}>{f.icon}</div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                  <div className={styles.orbCardArrow}>
                    <BsArrowRight size={14} />
                  </div>
                </motion.div>
              ))}
            </div>

            <div className={styles.orbitalMiddle}>
              {[{ icon: <IconQuill size={22} />, color: '#c084fc', bg: 'rgba(147,51,234,0.15)', title: 'Drafting AI', desc: 'Generate petitions & pleadings for Indian legal formats.' }].map((f, i) => (
                <motion.div
                  key={i}
                  className={styles.orbCard}
                  style={{ '--orb-color': f.color, '--orb-bg': f.bg } as React.CSSProperties}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                >
                  <div className={styles.orbCardIcon}>{f.icon}</div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                  <div className={styles.orbCardArrow}><BsArrowRight size={14} /></div>
                </motion.div>
              ))}

              <motion.div
                className={styles.orbCenter}
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, type: 'spring', stiffness: 60 }}
              >
                <div className={styles.orbCenterGlow} />
                <motion.div
                  animate={{ y: [0, -8, 0], scale: [1, 1.02, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className={styles.orbCenterInner}
                >
                  <LottieAnimation src="https://lottie.host/e109ed1b-4dd5-4c08-a93e-833e1730a18b/I4PD7iIlnI.lottie" />
                </motion.div>
                <div className={styles.orbRing1} />
                <div className={styles.orbRing2} />
              </motion.div>

              {[{ icon: <IconGraph size={22} />, color: '#fb923c', bg: 'rgba(249,115,22,0.15)', title: 'Risk Analysis', desc: 'Predict case outcome using historical AI modeling.' }].map((f, i) => (
                <motion.div
                  key={i}
                  className={styles.orbCard}
                  style={{ '--orb-color': f.color, '--orb-bg': f.bg } as React.CSSProperties}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                >
                  <div className={styles.orbCardIcon}>{f.icon}</div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                  <div className={styles.orbCardArrow}><BsArrowRight size={14} /></div>
                </motion.div>
              ))}
            </div>

            <div className={styles.orbitalBottom}>
              {[
                { icon: <IconGlobe size={22} />, color: '#818cf8', bg: 'rgba(99,102,241,0.15)', title: 'Multilingual Support', desc: 'Hindi, English & all major Indian regional languages.' },
                { icon: <IconSafe size={22} />, color: '#4ade80', bg: 'rgba(34,197,94,0.15)', title: 'Evidence Vault', desc: 'Encrypted workspace for exhibits & digital evidence.' },
                { icon: <IconUsers size={22} />, color: '#f472b6', bg: 'rgba(236,72,153,0.15)', title: 'Virtual Chambers', desc: 'Collaborate in real-time mock-trial sessions.' },
              ].map((f, i) => (
                <motion.div
                  key={i}
                  className={styles.orbCard}
                  style={{ '--orb-color': f.color, '--orb-bg': f.bg } as React.CSSProperties}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                >
                  <div className={styles.orbCardIcon}>{f.icon}</div>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                  <div className={styles.orbCardArrow}><BsArrowRight size={14} /></div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          STATS SECTION — WHITE THEME (Section 3 - light)
      ══════════════════════════════════════ */}
      <section className={styles.premiumStatsSection}>
        <div className={styles.statsBgGlow} />
        <div className={styles.statsBgGrid} />

        <div className={styles.statsInner}>
          <motion.div
            className={styles.statsHeader}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className={styles.sectionBadgeLight}>Platform Performance</span>
            <h2>Data-Driven Credibility. <br /><span className={styles.statsGradientText}>Proven at Scale.</span></h2>
            <p>Built for the modern legal professional, validated on thousands of real‑world courtroom scenarios.</p>
          </motion.div>

          <div className={styles.statsGrid}>
            {[
              { colSpan: 2, icon: <IconDatabase size={22} />, value: 25000, suffix: '+', label: 'Precedents Analyzed', sub: 'Real-time database covering decades of Supreme Court & High Court jurisprudence.' },
              { colSpan: 2, icon: <IconCheckCircle size={22} />, value: 98, suffix: '%', label: 'AI Evaluation Accuracy', sub: 'Validated by legal experts for argument scoring and citation mapping precision.' },
              { colSpan: 1, icon: <IconActivity size={22} />, value: 10000, suffix: '+', label: 'Simulations Run', sub: 'Helping users master courtroom advocacy through repetitive, high-stakes practice.' },
              { colSpan: 1, icon: <IconUsers size={22} />, value: 2000, suffix: '+', label: 'Law Students', sub: 'Active learners from top-tier national law universities.' },
              { colSpan: 1, icon: <IconShield size={22} />, value: 500, suffix: '+', label: 'Legal Professionals', sub: 'Advocates utilizing AI to refine litigation strategies.' },
              { colSpan: 1, icon: <IconBookOpen size={22} />, value: 50, suffix: '+', label: 'IPC / CrPC Modules', sub: 'Training modules covering major Indian penal codes.' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                className={`${styles.statCard} ${stat.colSpan === 2 ? styles.cardSpan2 : ''}`}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.08, duration: 0.6, ease: 'easeOut' }}
              >
                <div className={styles.bentoBgPattern} />
                <div className={styles.statCardContent}>
                  <div className={styles.statContentTop}>
                    <div className={styles.statIconWrapper}>{stat.icon}</div>
                    <div className={styles.statTextBackdrop}>
                      <h4 className={styles.statNumber}>
                        <StatCounter endValue={stat.value} suffix={stat.suffix} />
                      </h4>
                      <span className={styles.statLabel}>{stat.label}</span>
                      <span className={styles.statSub}>{stat.sub}</span>
                    </div>
                  </div>

                  {i === 0 && (
                    <div className={styles.visualEnhancement}>
                      <div className={styles.indexingGridWrapper}>
                        <div className={styles.indexingGridSweep} />
                        <div className={styles.indexingGrid}>
                          {Array.from({ length: 45 }).map((_, idx) => (
                            <div key={idx} className={`${styles.node} ${Math.random() < 0.2 ? styles.nodeActive : ''}`} />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {i === 1 && (
                    <div className={styles.visualEnhancement}>
                      <div className={styles.steepChartWrapper}>
                        <span className={styles.benchmarkLabel}>Human Average (85%)</span>
                        <svg viewBox="0 0 100 40" className={styles.steepChartSvg} preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="steepGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="rgba(59, 130, 246, 0.4)" />
                              <stop offset="100%" stopColor="rgba(59, 130, 246, 0)" />
                            </linearGradient>
                          </defs>
                          <line x1="0" y1="20" x2="100" y2="20" stroke="#94a3b8" strokeDasharray="1.5,1.5" strokeWidth="0.5" />
                          <motion.path
                            d="M0,24 C40,24 60,4 96,2"
                            fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round"
                            initial={{ pathLength: 0 }}
                            whileInView={{ pathLength: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.5, delay: 0.4, ease: [0.4, 0, 0.2, 1] }}
                          />
                          <path d="M0,24 C40,24 60,4 96,2 L96,40 L0,40 Z" fill="url(#steepGrad)" stroke="none" />
                          <motion.circle cx="96" cy="2" r="1.5" fill="#3b82f6"
                            initial={{ scale: 0, opacity: 0 }}
                            whileInView={{ scale: [1, 1.5, 1], opacity: [0.8, 1, 0.8] }}
                            viewport={{ once: true }}
                            transition={{ delay: 1.5, duration: 2, repeat: Infinity }}
                          />
                          <motion.circle cx="96" cy="2" r="4" fill="rgba(59, 130, 246, 0.4)"
                            initial={{ scale: 0, opacity: 0 }}
                            whileInView={{ scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] }}
                            viewport={{ once: true }}
                            transition={{ delay: 1.5, duration: 2, repeat: Infinity }}
                          />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            className={styles.credibilityStrip}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <div className={styles.credDivider} />
            <span className={styles.credText}>Trusted by law students, advocates, and legal educators across India</span>
            <div className={styles.credDivider} />
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          GET STARTED SECTION — DEEP BLUE (Section 4)
      ══════════════════════════════════════ */}
      <section className={styles.getStartedSection}>
        {/* Animated background mesh */}
        <div className={styles.gsMeshBg} />
        <div className={styles.gsGlowOrb1} />
        <div className={styles.gsGlowOrb2} />
        <div className={styles.gsGlowOrb3} />
        <FloatingParticles />

        <div className={styles.gsInner}>
          {/* Top badge */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className={styles.gsBadgeRow}
          >
            <span className={styles.gsBadge}>
              <BsRocketTakeoffFill style={{ marginRight: 8, color: '#fcd34d' }} />
              YOUR LEGAL CAREER STARTS HERE
            </span>
          </motion.div>

          {/* Main headline */}
          <motion.h2
            className={styles.gsHeadline}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.75 }}
          >
            The Courtroom Awaits.<br />
            <span className={styles.gsHeadlineAccent}>Are You Ready to Win?</span>
          </motion.h2>

          <motion.p
            className={styles.gsSubtext}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.7 }}
          >
            Join thousands of law students and legal professionals who are sharpening their skills,<br />
            winning simulations, and building the confidence to dominate in real courtrooms.
          </motion.p>

          {/* Benefits row */}
          <motion.div
            className={styles.gsBenefits}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            {[
              { icon: <BsAwardFill />, text: 'AI-Certified Practice' },
              { icon: <BsBarChartFill />, text: 'Track Your Growth' },
              { icon: <BsPeopleFill />, text: 'Community of 5,000+' },
              { icon: <BsBriefcaseFill />, text: 'Real Case Scenarios' },
              { icon: <BsBookFill />, text: '50+ Legal Modules' },
              { icon: <BsGlobeCentralSouthAsia />, text: 'Multilingual Support' },
            ].map((b, i) => (
              <motion.div
                key={i}
                className={styles.gsBenefit}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.06, duration: 0.4 }}
                whileHover={{ scale: 1.06, transition: { duration: 0.15 } }}
              >
                <span className={styles.gsBenefitIcon}>{b.icon}</span>
                <span>{b.text}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* THE BIG GET STARTED BUTTON */}
          <motion.div
            className={styles.gsCTAWrapper}
            initial={{ opacity: 0, scale: 0.85 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.7, type: 'spring', stiffness: 60 }}
          >
            <div className={styles.gsCtaGlow} />
            <Link to="/cases">
              <motion.button
                className={styles.gsGetStartedBtn}
                whileHover={{
                  scale: 1.06,
                  boxShadow: '0 0 80px rgba(99,179,237,0.5), 0 30px 60px rgba(59,130,246,0.4)',
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.97 }}
              >
                <span className={styles.gsBtnShine} />
                <span className={styles.gsBtnIcon}>
                  <BsRocketTakeoffFill size={28} />
                </span>
                <span className={styles.gsBtnText}>
                  Get Started — It's Free
                </span>
                <span className={styles.gsBtnArrow}>
                  <BsArrowUpRightCircleFill size={22} />
                </span>
              </motion.button>
            </Link>
            <p className={styles.gsCtaHint}>
              <BsShieldFill style={{ color: '#4ade80', marginRight: 6, verticalAlign: 'middle' }} />
              No credit card required · Free forever for students
            </p>
          </motion.div>

          {/* Social proof avatars */}
          <motion.div
            className={styles.gsAvatarRow}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <div className={styles.gsAvatars}>
              {['S', 'R', 'P', 'A', 'K'].map((letter, i) => (
                <div key={i} className={styles.gsAvatar} style={{
                  background: `hsl(${200 + i * 30}, 70%, 55%)`,
                  marginLeft: i > 0 ? '-10px' : 0,
                  zIndex: 5 - i,
                }}>
                  {letter}
                </div>
              ))}
            </div>
            <div className={styles.gsAvatarText}>
              <div className={styles.gsStars}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <BsStarFill key={i} style={{ color: '#fcd34d', fontSize: '12px' }} />
                ))}
              </div>
              <span>Loved by <strong>5,000+</strong> legal professionals</span>
            </div>
          </motion.div>

          {/* Bottom feature cards */}
          <motion.div
            className={styles.gsFeatureCards}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.7 }}
          >
            {[
              {
                icon: <BsGavel size={20} />,
                title: 'Start a Case',
                desc: 'Pick from 100+ real Indian court scenarios and argue your position.',
                tag: 'Most Popular',
                tagColor: '#fcd34d',
              },
              {
                icon: <BsBarChartFill size={20} />,
                title: 'Track Progress',
                desc: 'See your skill growth across argument clarity, evidence usage, and more.',
                tag: 'AI-Powered',
                tagColor: '#60a5fa',
              },
              {
                icon: <BsTrophyFill size={20} />,
                title: 'Climb Rankings',
                desc: 'Compete on the leaderboard and earn certifications for your achievements.',
                tag: 'Competitive',
                tagColor: '#4ade80',
              },
            ].map((card, i) => (
              <motion.div
                key={i}
                className={styles.gsFeatureCard}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
              >
                <div className={styles.gsCardIcon}>{card.icon}</div>
                <span className={styles.gsCardTag} style={{ color: card.tagColor, borderColor: card.tagColor }}>{card.tag}</span>
                <h4>{card.title}</h4>
                <p>{card.desc}</p>
                <div className={styles.gsCardArrow}>
                  <BsArrowRight size={16} />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

// Re-export inline for gavel icon (used in gsFeatureCards)
const BsGavel = ({ size = 24 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m14 13-7.5 7.5c-.8.8-2.1.8-2.9 0l-1.1-1.1c-.8-.8-.8-2.1 0-2.9L10 9" />
    <path d="m14 6 4 4" /><path d="M21 7 17 3" />
    <path d="m21 7-4-4-2 2 4 4z" /><path d="m17 11 4-4-2-2-4 4z" />
    <path d="M18 12 12 6" />
  </svg>
);

export default LandingPage;