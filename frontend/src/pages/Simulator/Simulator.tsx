import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './Simulator.module.scss';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../../components/Navbar/Navbar';

const IconMic = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
);
const IconMicOff = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V5a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
);
const IconSend = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M2 21L23 12L2 3V10L17 12L2 14V21Z" /></svg>
);
const IconChevronDown = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="6 9 12 15 18 9"/></svg>
);
const IconChevronUp = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="18 15 12 9 6 15"/></svg>
);
const IconClock = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);
const IconLogout = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
);
const IconScale = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/>
    <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/>
    <path d="M7 21h10"/><path d="M12 3v18"/>
    <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/>
  </svg>
);
const IconX = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);
const IconLightbulb = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5"/>
    <path d="M9 18h6"/><path d="M10 22h4"/>
  </svg>
);
const IconVolume2 = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
);
const IconPause = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
);
const IconRobot = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="8" width="18" height="12" rx="2"/>
    <path d="M12 8V4"/><circle cx="12" cy="3" r="1"/>
    <path d="M8 13h.01M16 13h.01"/><path d="M9 17h6"/>
  </svg>
);
const IconUsers = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IconArrowRight = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
);
const IconUser = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconFileText = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
);

interface CaseFacts {
  title: string;
  type: string;
  facts: string;
  evidence: string[];
  legal_provisions: string[];
}

interface ChatMessage {
  id: string;
  type: 'user' | 'judge' | 'opponent' | 'system';
  text: string;
  scores?: {
    legal: number;
    reasoning: number;
    evidence: number;
    overall: number;
    turn_score: number;
    cumulative_score: number;
    performance_tier: string;
  };
  suggestions?: string[];
  incorrect_sections?: { section: string; reason: string }[];
}

type GameMode = 'ai' | null;

// ── MODE SELECTION MODAL ──────────────────────────────────────────────────────
const ModeSelectionModal = ({
  caseTitle,
  onSelect,
  onClose,
}: {
  caseTitle: string;
  onSelect: (mode: GameMode, language: string) => void;
  onClose: () => void;
}) => {
  const [selectedMode, setSelectedMode] = useState<GameMode>(null);
  const [language, setLanguage] = useState("English");

  const languages = [
    "English","Hindi","Bengali","Telugu","Marathi","Tamil","Urdu","Gujarati",
    "Kannada","Odia","Malayalam","Punjabi","Assamese","Maithili","Santali",
    "Kashmiri","Nepali","Sindhi","Dogri","Konkani","Manipuri","Bodo","Sanskrit"
  ];

  const handleBegin = () => {
    if (!selectedMode) return;
    onSelect(selectedMode, language);
  };

  return (
    <AnimatePresence>
      <motion.div
        className={styles.modalOverlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className={styles.modeModal}
          initial={{ opacity: 0, y: 36, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 240, damping: 24 }}
        >
          <div className={styles.modalGavel}>
            <IconScale size={34} />
          </div>

          <button className={styles.modalClose} onClick={onClose}>
            <IconX size={16} />
          </button>

          <div className={styles.modalHeader}>
            <span className={styles.modalEyebrow}>Select Simulation Mode</span>
            <h2 className={styles.modalTitle}>{caseTitle}</h2>
            <p className={styles.modalSub}>Choose language and simulation type</p>
          </div>

          <div style={{ padding: "14px 22px 4px" }}>
            <label style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "#64748b", display: "block", marginBottom: "6px" }}>
              Choose Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              style={{ width: "100%", padding: "9px 12px", borderRadius: "8px", border: "1px solid #e4e8f0", fontSize: "0.85rem", background: "#f8fafc", cursor: "pointer" }}
            >
              {languages.map((lang) => (<option key={lang}>{lang}</option>))}
            </select>
          </div>

          <div className={styles.modeCards}>
            <motion.button
              className={`${styles.modeCard} ${selectedMode === "ai" ? styles.modeSelectedAI : ""}`}
              data-mode="ai"
              onClick={() => setSelectedMode("ai")}
            >
              <div className={styles.modeCardIcon}><IconRobot size={26} /></div>
              <div className={styles.modeCardBody}>
                <h3>Play vs AI</h3>
                <p>Argue against an AI-powered opposing counsel with real-time judge feedback.</p>
                <ul className={styles.modeFeatures}>
                  <li>AI opponent adapts to your arguments</li>
                  <li>Instant scoring & analysis</li>
                  <li>Voice-to-text support</li>
                </ul>
              </div>
              <div className={styles.modeCardCta}>Select Mode <IconArrowRight size={14} /></div>
            </motion.button>

            
          </div>

          <div style={{ padding: "10px 22px 18px", display: "flex", justifyContent: "center" }}>
            <button
              onClick={handleBegin}
              disabled={!selectedMode}
              style={{ padding: "10px 28px", background: "linear-gradient(135deg,#1535a0 0%,#2563eb 100%)", color: "white", border: "none", borderRadius: "10px", fontSize: "0.85rem", fontWeight: 700, cursor: selectedMode ? "pointer" : "not-allowed", opacity: selectedMode ? 1 : 0.4 }}
            >
              Begin Simulation
            </button>
          </div>

          <div className={styles.modalFooter}>
            <span>All sessions are logged for performance tracking</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ── CASE DESCRIPTION POPUP ───────────────────────────────────────────────────
const CaseDescriptionPopup = ({
  caseFacts,
  onClose,
}: {
  caseFacts: CaseFacts;
  onClose: () => void;
}) => {
  return (
    <AnimatePresence>
      <motion.div
        className={styles.modalOverlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className={styles.caseDescModal}
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 260, damping: 26 }}
          onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
        >
          {/* Header */}
          <div className={styles.caseDescHeader}>
            <div className={styles.caseDescHeaderLeft}>
              <div className={styles.caseDescIcon}><IconScale size={18} /></div>
              <div>
                <span className={styles.caseDescEyebrow}>Case Brief</span>
                <h2 className={styles.caseDescTitle}>{caseFacts.title}</h2>
              </div>
            </div>
            <button className={styles.caseDescClose} onClick={onClose}>
              <IconX size={15} />
            </button>
          </div>

          <div className={styles.caseDescBody}>
            {/* Type badge */}
            <div className={styles.caseDescTypeBadge}>{caseFacts.type}</div>

            {/* Facts */}
            <div className={styles.caseDescSection}>
              <h3 className={styles.caseDescSectionTitle}>
                <span className={styles.caseDescDot} style={{ background: '#2563eb' }} />
                Brief Facts
              </h3>
              <p className={styles.caseDescText}>{caseFacts.facts}</p>
            </div>

            {/* Evidence */}
            {caseFacts.evidence?.length > 0 && (
              <div className={styles.caseDescSection}>
                <h3 className={styles.caseDescSectionTitle}>
                  <span className={styles.caseDescDot} style={{ background: '#10b981' }} />
                  Evidence & Exhibits
                </h3>
                <ul className={styles.caseDescEvidenceList}>
                  {caseFacts.evidence.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Legal provisions */}
            {caseFacts.legal_provisions?.length > 0 && (
              <div className={styles.caseDescSection}>
                <h3 className={styles.caseDescSectionTitle}>
                  <span className={styles.caseDescDot} style={{ background: '#f59e0b' }} />
                  Legal Provisions
                </h3>
                <div className={styles.caseDescProvisionTags}>
                  {caseFacts.legal_provisions.map((p, i) => (
                    <span key={i} className={styles.caseDescProvisionTag}>{p}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className={styles.caseDescFooter}>
            <button className={styles.caseDescCloseBtn} onClick={onClose}>Close</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ── CASE DESCRIPTION PREVIEW MODAL (pre-start) ──────────────────────────────
const CasePreviewModal = ({
  caseFacts,
  onStart,
}: {
  caseFacts: CaseFacts;
  onStart: () => void;
}) => {
  return (
    <AnimatePresence>
      <motion.div
        className={styles.modalOverlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className={styles.modeModal}
          initial={{ opacity: 0, y: 36, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 240, damping: 24 }}
        >
          <div className={styles.modalHeader}>
            <span className={styles.modalEyebrow}>Case Description</span>
            <h2 className={styles.modalTitle}>{caseFacts.title}</h2>
          </div>

          <div style={{ padding: "18px 22px", maxHeight: "420px", overflowY: "auto" }}>
            <div className={styles.infoSection}>
              <h3>Overview</h3>
              <p>{caseFacts.facts}</p>
            </div>
            <div className={styles.infoSection}>
              <h3>Evidence & Exhibits</h3>
              <ul className={styles.evidenceList}>
                {caseFacts.evidence?.map((e, i) => (<li key={i}>{e}</li>))}
              </ul>
            </div>
            {caseFacts.legal_provisions?.length > 0 && (
              <div className={styles.infoSection}>
                <h3>Legal Provisions</h3>
                <div className={styles.provisionTags}>
                  {caseFacts.legal_provisions.map((p, i) => (
                    <span key={i} className={styles.provisionTag}>{p}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{ padding: "16px", display: "flex", justifyContent: "center" }}>
            <button onClick={onStart} className={styles.beginButton}>Start Simulation</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ── AVATAR COMPONENT ─────────────────────────────────────────────────────────
const Avatar = ({ type, isActive, label }: { type: 'user' | 'ai' | 'judge'; isActive?: boolean; label: string }) => {
  const colors = {
    user: { bg: '#1535a0', border: '#3b7af5', glow: 'rgba(37,99,235,0.4)' },
    ai: { bg: '#7c3aed', border: '#a855f7', glow: 'rgba(168,85,247,0.4)' },
    judge: { bg: '#1e3a5f', border: '#2563eb', glow: 'rgba(37,99,235,0.5)' },
  };
  const c = colors[type];

  return (
    <div className={styles.avatarWrap}>
      <motion.div
        className={styles.avatarRing}
        animate={isActive ? { boxShadow: [`0 0 0 0px ${c.glow}`, `0 0 0 8px transparent`] } : {}}
        transition={{ repeat: Infinity, duration: 1.5 }}
        style={{ borderColor: isActive ? c.border : 'transparent' }}
      >
        <div className={styles.avatarCircle} style={{ background: c.bg, borderColor: c.border }}>
          {type === 'user' && <IconUser size={22} className={styles.avatarIcon} />}
          {type === 'ai' && <IconRobot size={22} className={styles.avatarIcon} />}
          {type === 'judge' && <IconScale size={22} className={styles.avatarIcon} />}
        </div>
      </motion.div>
      <span className={styles.avatarLabel}>{label}</span>
      {isActive && <span className={styles.avatarActiveDot} style={{ background: c.border }} />}
    </div>
  );
};

// ── SCORE RING ────────────────────────────────────────────────────────────────
const ScoreRing = ({ score, label }: { score: number; label: string }) => {
  const r = 30;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  return (
    <div className={styles.scoreRing}>
      <svg width="76" height="76" viewBox="0 0 76 76">
        <circle cx="38" cy="38" r={r} fill="none" stroke="rgba(37,99,235,0.15)" strokeWidth="6" />
        <motion.circle
          cx="38" cy="38" r={r}
          fill="none"
          stroke="#2563eb"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${circ}`}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1, delay: 0.2 }}
          style={{ transform: 'rotate(-90deg)', transformOrigin: '38px 38px' }}
        />
        <text x="38" y="43" textAnchor="middle" fill="#1535a0" fontSize="14" fontWeight="700">{score}</text>
      </svg>
      <span className={styles.scoreRingLabel}>{label}</span>
    </div>
  );
};

// ── COLLAPSIBLE USER ARG CARD ─────────────────────────────────────────────────
const CollapsibleUserCard = ({ msg, isLatest }: { msg: ChatMessage; isLatest: boolean }) => {
  const [open, setOpen] = useState(isLatest);

  // When a new latest comes in, collapse old ones
  useEffect(() => {
    if (!isLatest) setOpen(false);
  }, [isLatest]);

  const preview = msg.text.length > 80 ? msg.text.slice(0, 80) + '…' : msg.text;

  return (
    <div className={`${styles.userArgCard} ${!isLatest ? styles.collapsedCard : ''}`}>
      <div
        className={styles.collapsibleHeader}
        onClick={() => !isLatest && setOpen(o => !o)}
        style={{ cursor: isLatest ? 'default' : 'pointer' }}
      >
        <span className={styles.collapseLabel}>YOU</span>
        {!isLatest && (
          <div className={styles.collapseRight}>
            {!open && <span className={styles.collapsePreview}>{preview}</span>}
            {open ? <IconChevronUp size={13} /> : <IconChevronDown size={13} />}
          </div>
        )}
      </div>
      <AnimatePresence initial={false}>
        {(isLatest || open) && (
          <motion.div
            initial={!isLatest ? { height: 0, opacity: 0 } : false}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <p className={styles.userArgText}>{msg.text}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── COLLAPSIBLE OPPONENT CARD ─────────────────────────────────────────────────
const CollapsibleOpponentCard = ({
  msg,
  isLatest,
  gameMode,
  playingMsgId,
  onPlay,
  onPause,
}: {
  msg: ChatMessage;
  isLatest: boolean;
  gameMode: GameMode;
  playingMsgId: string | null;
  onPlay: (id: string, text: string) => void;
  onPause: () => void;
}) => {
  const [open, setOpen] = useState(isLatest);

  useEffect(() => {
    if (!isLatest) setOpen(false);
  }, [isLatest]);

  const preview = msg.text.length > 80 ? msg.text.slice(0, 80) + '…' : msg.text;

  return (
    <div className={`${styles.opponentArgCard} ${!isLatest ? styles.collapsedCard : ''}`}>
      <div
        className={styles.opponentTop}
        onClick={() => !isLatest && setOpen(o => !o)}
        style={{ cursor: isLatest ? 'default' : 'pointer' }}
      >
        <div className={styles.opponentTopLeft}>
          <span className={styles.bubbleLabelSmall}>
            {gameMode === 'ai' ? 'Opposing Counsel (AI)' : 'Opposing Counsel'}
          </span>
          {!isLatest && !open && <span className={styles.collapsePreview}>{preview}</span>}
        </div>
        <div className={styles.opponentTopRight}>
          {(isLatest || open) && (
            <button
              className={`${styles.ttsBtn} ${playingMsgId === msg.id ? styles.ttsBtnActive : ''}`}
              onClick={(e) => { e.stopPropagation(); playingMsgId === msg.id ? onPause() : onPlay(msg.id, msg.text); }}
            >
              {playingMsgId === msg.id ? <IconPause size={11} /> : <IconVolume2 size={11} />}
              {playingMsgId === msg.id ? 'Pause' : 'Speak'}
            </button>
          )}
          {!isLatest && (open ? <IconChevronUp size={13} /> : <IconChevronDown size={13} />)}
        </div>
      </div>
      <AnimatePresence initial={false}>
        {(isLatest || open) && (
          <motion.div
            initial={!isLatest ? { height: 0, opacity: 0 } : false}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden' }}
          >
            <p className={styles.opponentArgText}>{msg.text}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── JUDGE RESPONSE ────────────────────────────────────────────────────────────
const JudgeResponse = ({ m, isLatest }: { m: ChatMessage; isLatest: boolean }) => {
  const [isOpen, setIsOpen] = useState(isLatest);
  const [summary, detailed] = m.text.includes("Detailed Analysis:")
    ? m.text.split("Detailed Analysis:")
    : [m.text, ""];

  useEffect(() => {
    if (!isLatest) setIsOpen(false);
  }, [isLatest]);

  return (
    <div className={`${styles.judgeContainer} ${!isLatest ? styles.judgeContainerCollapsed : ''}`}>
      <div className={styles.judgeHeader} onClick={() => setIsOpen(!isOpen)}>
        <div className={styles.judgeHeaderLeft}>
          <IconScale size={15} className={styles.judgeIcon} />
          <span>Judge's Ruling</span>
        </div>
        <div className={styles.judgeHeaderRight}>
          {m.scores && <span className={styles.overallPill}>{m.scores.overall}%</span>}
          {isOpen ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={styles.judgeContent}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
          >
            <div className={styles.judgeText}>
              {summary.split('\n\n').map((p, idx) => {
                if (!p.trim()) return null;
                return <p key={idx}>{p}</p>;
              })}
              {detailed && (
                <div className={styles.detailedSection}>
                  <span className={styles.detailedLabel}>Detailed Analysis</span>
                  <p>{detailed.trim()}</p>
                </div>
              )}
            </div>

            {m.scores && (
              <div className={styles.scoresGrid}>
                {[
                  { label: 'Legal Accuracy', val: m.scores.legal },
                  { label: 'Reasoning & Logic', val: m.scores.reasoning },
                  { label: 'Evidence Use', val: m.scores.evidence },
                ].map((s) => (
                  <div key={s.label} className={styles.scoreItem}>
                    <div className={styles.scoreHeader}>
                      <span>{s.label}</span>
                      <span className={styles.scoreVal}>{s.val}</span>
                    </div>
                    <div className={styles.progressTrack}>
                      <motion.div
                        className={styles.progressFill}
                        initial={{ width: 0 }}
                        animate={{ width: `${s.val}%` }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                      />
                    </div>
                  </div>
                ))}

                <div className={styles.overallRow}>
                  <div className={styles.tierBadge}>
                    <span className={styles.tierLabel}>Tier</span>
                    <span className={styles.tierVal}>{m.scores.performance_tier}</span>
                  </div>
                  <div className={styles.impactBadge}>
                    <span className={styles.tierLabel}>Court Impact</span>
                    <span className={styles.impactVal}>{m.scores.overall}%</span>
                  </div>
                </div>
              </div>
            )}

            {m.incorrect_sections && m.incorrect_sections.length > 0 && (
              <div className={styles.incorrectSections}>
                <div className={styles.subSectionTitle}>
                  <IconX size={13} /> Incorrect Citations
                </div>
                {m.incorrect_sections.map((s, i) => (
                  <div key={i} className={styles.incorrectItem}>
                    <span className={styles.sectionTag}>§{s.section}</span>
                    <span>{s.reason}</span>
                  </div>
                ))}
              </div>
            )}

            {m.suggestions && m.suggestions.length > 0 && (
              <div className={styles.suggestions}>
                <div className={styles.subSectionTitle}>
                  <IconLightbulb size={13} /> Suggestions
                </div>
                <ul>
                  {m.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── MAIN SIMULATOR ────────────────────────────────────────────────────────────
const Simulator = () => {
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();

  const [gameMode, setGameMode] = useState<GameMode>(null);
  const [showModeModal, setShowModeModal] = useState(true);
  const [showCasePreview, setShowCasePreview] = useState(false);
  const [showCaseDescription, setShowCaseDescription] = useState(false);

  const [sessionId, setSessionId] = useState<string>('');
  const [caseFacts, setCaseFacts] = useState<CaseFacts | null>(null);
  const [phase, setPhase] = useState<string>('opening_statement');

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userMessages, setUserMessages] = useState<ChatMessage[]>([]);
  const [judgeMessages, setJudgeMessages] = useState<ChatMessage[]>([]);
  const [opponentMessages, setOpponentMessages] = useState<ChatMessage[]>([]);

  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  const [isRecording, setIsRecording] = useState(false);
  const [audioStatus, setAudioStatus] = useState<string>('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const userChatEndRef = useRef<HTMLDivElement>(null);
  const judgeChatEndRef = useRef<HTMLDivElement>(null);
  const opponentChatEndRef = useRef<HTMLDivElement>(null);

  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);
  const [playingMsgId, setPlayingMsgId] = useState<string | null>(null);
  const playingRef = useRef<string | null>(null);
  const loadedMsgIdRef = useRef<string | null>(null);

  const [timeLeft, setTimeLeft] = useState(1800);
  const [lastScore, setLastScore] = useState<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(prev => (prev > 0 ? prev - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  useEffect(() => {
    const initSession = async () => {
      try {
        const res = await axios.post("http://localhost:8000/api/session/create", {
          case_id: caseId,
          user_id: "demo_user_001",
          mode: 'criminal'
        });
        setSessionId(res.data.session_id);
        setCaseFacts(res.data.case_facts);
        setPhase(res.data.current_phase);
        const systemMsg: ChatMessage = {
          id: 'welcome',
          type: 'system',
          text: `Court is now in session — AI Opponent Mode`
        };
        setMessages([systemMsg]);
        setJudgeMessages([systemMsg]);
      } catch (err) {
        console.error("Session init failed", err);
      }
    };
    if (caseId && gameMode) initSession();
  }, [caseId, gameMode]);

  useEffect(() => {
    userChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [userMessages]);
  useEffect(() => {
    judgeChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [judgeMessages]);
  useEffect(() => {
    opponentChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [opponentMessages]);

  const handleModeSelect = (mode: GameMode, language: string) => {
    setGameMode(mode);
    setSelectedLanguage(language);
    setShowModeModal(false);
    setShowCasePreview(true);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      audioChunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mr.onstop = async () => {
        await processAudioUpload(new Blob(audioChunksRef.current, { type: 'audio/wav' }));
      };
      mr.start();
      setIsRecording(true);
      setAudioStatus('Recording…');
    } catch { setAudioStatus('Microphone access failed.'); }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setAudioStatus('Processing audio…');
    }
  };

  const toggleRecording = () => { isRecording ? stopRecording() : startRecording(); };

  const playFastTTS = async (msgId: string, text: string) => {
    if (loadedMsgIdRef.current === msgId && ttsAudioRef.current) {
      playingRef.current = msgId;
      setPlayingMsgId(msgId);
      ttsAudioRef.current.play().catch(() => {});
      return;
    }
    if (ttsAudioRef.current) { ttsAudioRef.current.pause(); }
    loadedMsgIdRef.current = msgId;
    playingRef.current = msgId;
    setPlayingMsgId(msgId);
    try {
      const langParam = encodeURIComponent(selectedLanguage);
      const textParam = encodeURIComponent(text.trim().substring(0, 2500));
      const res = await fetch(`http://localhost:8000/api/audio/tts?text=${textParam}&language=${langParam}&role=opponent`);
      if (!res.ok) throw new Error("TTS failed");
      const url = URL.createObjectURL(await res.blob());
      const audio = new Audio(url);
      audio.playbackRate = 1.25;
      ttsAudioRef.current = audio;
      await new Promise<void>((resolve, reject) => {
        audio.onended = () => {
          URL.revokeObjectURL(url);
          playingRef.current = null;
          setPlayingMsgId(null);
          loadedMsgIdRef.current = null;
          resolve();
        };
        audio.onerror = reject;
        audio.play().catch(reject);
      });
    } catch { /* silent */ }
    finally {
      if (playingRef.current === msgId) { playingRef.current = null; setPlayingMsgId(null); }
    }
  };

  const pauseTTS = () => {
    if (ttsAudioRef.current) { ttsAudioRef.current.pause(); }
    playingRef.current = null;
    setPlayingMsgId(null);
  };

  const processAudioUpload = async (blob: Blob) => {
    const fd = new FormData();
    fd.append('file', blob, 'recording.wav');
    try {
      const langParam = encodeURIComponent(selectedLanguage);
      const res = await axios.post(`http://localhost:8000/api/audio/speech-to-text?language=${langParam}`, fd);
      if (res.data.transcript) {
        setInputText(res.data.transcript);
        setAudioStatus('Transcription complete.');
        setTimeout(() => setAudioStatus(''), 3000);
      }
    } catch { setAudioStatus('Transcription failed.'); }
  };

  const submitArgument = async () => {
    if (!inputText.trim() || !sessionId) return;
    const rx = /section\s*(\d+[A-Z]?)/gi;
    const cited: string[] = [];
    let m;
    while ((m = rx.exec(inputText)) !== null) cited.push(m[1]);

    const newMsg: ChatMessage = { id: Date.now().toString(), type: 'user', text: inputText };
    setMessages(prev => [...prev, newMsg]);
    setUserMessages(prev => [...prev, newMsg]);
    setInputText('');
    setLoading(true);

    try {
      let mappedPhase = phase;
      if (mappedPhase === "opening_statements") mappedPhase = "opening_statement";
      if (mappedPhase === "closing_statements") mappedPhase = "closing_statement";

      const res = await axios.post("http://localhost:8000/api/argument/submit", {
        session_id: sessionId,
        argument_text: newMsg.text,
        cited_sections: cited,
        evidence_references: [],
        phase: mappedPhase,
        language: selectedLanguage
      });

      const { feedback, legal_accuracy_score, reasoning_score, evidence_score, overall_score, opponent_response } = res.data;

      const judgeMsg: ChatMessage = {
        id: Date.now().toString() + '_j',
        type: 'judge',
        text: feedback || "Your argument has been received and evaluated.",
        scores: {
          legal: legal_accuracy_score ?? 0,
          reasoning: reasoning_score ?? 0,
          evidence: evidence_score ?? 0,
          overall: overall_score ?? 0,
          turn_score: res.data.turn_score ?? 0,
          cumulative_score: res.data.cumulative_score ?? 0,
          performance_tier: res.data.performance_tier ?? 'Law Student',
        },
        suggestions: res.data.suggestions ?? [],
        incorrect_sections: res.data.incorrect_sections ?? [],
      };

      setMessages(prev => [...prev, judgeMsg]);
      setJudgeMessages(prev => [...prev, judgeMsg]);
      setLastScore(overall_score ?? 0);

      if (opponent_response) {
        const opp: ChatMessage = { id: Date.now().toString() + '_o', type: 'opponent', text: opponent_response };
        setMessages(prev => [...prev, opp]);
        setOpponentMessages(prev => [...prev, opp]);

        const AUTO_PLAY = false;
        if (AUTO_PLAY) setTimeout(() => playFastTTS(opp.id, opp.text), 500);
      }
    } catch (err: any) {
      const errMsg: ChatMessage = { id: Date.now().toString() + '_e', type: 'system', text: `Error: ${err.message}` };
      setMessages(prev => [...prev, errMsg]);
      setJudgeMessages(prev => [...prev, errMsg]);
    } finally { setLoading(false); }
  };

  const terminateSession = () => {
    if (window.confirm("Terminate this session? Unsaved progress will be lost.")) {
      navigate('/judgementsearch');
    }
  };

  if (!caseId) return (
    <div className={styles.emptyState}>
      <IconScale size={40} />
      <h2>No Case Selected</h2>
      <p>Return to the cases page to select a matter for simulation.</p>
      <button onClick={() => navigate('/simulator')}>Browse Cases</button>
    </div>
  );

  if (!caseFacts && gameMode) return (
    <div className={styles.loadingContainer}>
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }} className={styles.loader} />
      <p>Consulting Judicial Records…</p>
    </div>
  );

  // Derive latest message ids for each column
  const latestUserMsgId = userMessages.filter(m => m.type === 'user').slice(-1)[0]?.id;
  const latestJudgeMsgId = judgeMessages.filter(m => m.type === 'judge').slice(-1)[0]?.id;
  const latestOpponentMsgId = opponentMessages.filter(m => m.type === 'opponent').slice(-1)[0]?.id;

  return (
    <div className={styles.fullPage}>
      <Navbar />

      <AnimatePresence>
        {showModeModal && (
          <ModeSelectionModal
            caseTitle={caseFacts?.title || `Case #${caseId}`}
            onSelect={handleModeSelect}
            onClose={() => navigate(-1)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showCasePreview && caseFacts && (
          <CasePreviewModal caseFacts={caseFacts} onStart={() => setShowCasePreview(false)} />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showCaseDescription && caseFacts && (
          <CaseDescriptionPopup caseFacts={caseFacts} onClose={() => setShowCaseDescription(false)} />
        )}
      </AnimatePresence>

      {gameMode && caseFacts && (
        <div className={styles.arenaLayout}>

          {/* ── TOP BAR ── */}
          <div className={styles.arenaTopBar}>
            <div className={styles.topBarLeft}>
              <span className={styles.caseType}>{caseFacts.type}</span>
              <span className={styles.caseTitle}>{caseFacts.title}</span>
              {/* Case Description Button */}
              <button
                className={styles.caseDescBtn}
                onClick={() => setShowCaseDescription(true)}
                title="View case description"
              >
                <IconFileText size={13} />
                Case Brief
              </button>
            </div>
            <div className={styles.topBarCenter}>
              <span className={styles.phaseBadge}>{phase.replace(/_/g, ' ').toUpperCase()}</span>
              {lastScore !== null && (
                <span className={styles.liveScore}>
                  <span className={styles.liveScoreDot} />
                  Score: <strong>{lastScore}%</strong>
                </span>
              )}
            </div>
            <div className={styles.topBarRight}>
              <div className={`${styles.timerCompact} ${timeLeft < 300 ? styles.timerUrgent : ''}`}>
                <IconClock size={13} />
                <span>{formatTime(timeLeft)}</span>
              </div>
              <button className={styles.terminateBtn} onClick={terminateSession}>
                <IconLogout size={13} /> End Session
              </button>
            </div>
          </div>

          {/* ── ARENA COLUMNS ── */}
          <div className={styles.arenaColumns}>

            {/* LEFT — USER */}
            <div className={`${styles.arenaCol} ${styles.userCol}`}>
              <div className={styles.colHeader}>
                <Avatar type="user" isActive={!loading} label="You — Defence" />
              </div>

              <div className={styles.colFeed}>
                <AnimatePresence initial={false}>
                  {userMessages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.26 }}
                    >
                      {msg.type === 'user' && (
                        <CollapsibleUserCard
                          msg={msg}
                          isLatest={msg.id === latestUserMsgId}
                        />
                      )}
                      {msg.type === 'system' && (
                        <div className={styles.systemMsgSmall}>{msg.text}</div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={userChatEndRef} />
              </div>

              {/* Input area at bottom of user col */}
              <div className={styles.inputArea}>
                <AnimatePresence>
                  {audioStatus && (
                    <motion.div
                      className={styles.audioStatus}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      {audioStatus}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className={styles.inputRow}>
                  <button
                    className={`${styles.recordBtn} ${isRecording ? styles.recordingActive : ''}`}
                    onClick={toggleRecording}
                    title={isRecording ? 'Stop recording' : 'Start voice input'}
                  >
                    <motion.div
                      animate={isRecording ? { scale: [1, 1.15, 1] } : {}}
                      transition={{ repeat: Infinity, duration: 1 }}
                    >
                      {isRecording ? <IconMicOff size={16} /> : <IconMic size={16} />}
                    </motion.div>
                  </button>

                  <textarea
                    className={styles.argumentInput}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Submit your argument…"
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitArgument(); } }}
                    rows={3}
                  />

                  <button
                    className={styles.submitBtn}
                    onClick={submitArgument}
                    disabled={loading || !inputText.trim()}
                  >
                    <IconSend size={15} />
                  </button>
                </div>
              </div>
            </div>

            {/* CENTER — JUDGE */}
            <div className={`${styles.arenaCol} ${styles.judgeCol}`}>
              <div className={styles.colHeader}>
                <Avatar type="judge" isActive={loading} label="The Bench" />
                {lastScore !== null && <ScoreRing score={lastScore} label="Impact" />}
              </div>

              <div className={styles.colFeed}>
                <AnimatePresence initial={false}>
                  {judgeMessages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.26 }}
                    >
                      {msg.type === 'judge' && (
                        <JudgeResponse
                          m={msg}
                          isLatest={msg.id === latestJudgeMsgId}
                        />
                      )}
                      {msg.type === 'system' && (
                        <div className={styles.systemMsg}>{msg.text}</div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {loading && (
                  <motion.div className={styles.thinkingRow} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className={styles.wave}>
                      {[...Array(5)].map((_, i) => <span key={i} />)}
                    </div>
                    <span className={styles.thinkingText}>The bench is deliberating…</span>
                  </motion.div>
                )}
                <div ref={judgeChatEndRef} />
              </div>
            </div>

            {/* RIGHT — OPPONENT */}
            <div className={`${styles.arenaCol} ${styles.opponentCol}`}>
              <div className={styles.colHeader}>
                <Avatar
                  type="ai"
                  isActive={opponentMessages.length > 0 && !loading}
                  label={gameMode === 'ai' ? 'AI Opposing Counsel' : 'Opposing Counsel'}
                />
              </div>

              <div className={styles.colFeed}>
                <AnimatePresence initial={false}>
                  {opponentMessages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.26 }}
                    >
                      {msg.type === 'opponent' && (
                        <CollapsibleOpponentCard
                          msg={msg}
                          isLatest={msg.id === latestOpponentMsgId}
                          gameMode={gameMode}
                          playingMsgId={playingMsgId}
                          onPlay={playFastTTS}
                          onPause={pauseTTS}
                        />
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {opponentMessages.length === 0 && !loading && (
                  <div className={styles.emptyColHint}>
                    <IconRobot size={28} className={styles.emptyColIcon} />
                    <p>Opposing counsel will respond after your first argument.</p>
                  </div>
                )}
                <div ref={opponentChatEndRef} />
              </div>
            </div>

          </div>{/* end arenaColumns */}
        </div>
      )}
    </div>
  );
};

export default Simulator;