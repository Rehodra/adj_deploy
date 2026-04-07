import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from "../../components/Navbar/Navbar";
import styles from './Dashboard.module.scss';
import {
  BsLightningCharge,
  BsGraphUp,
  BsCalendar4Week,
  BsClockHistory,
  BsAward,
  BsCheck2Circle,
  BsHouseDoor,
  BsBriefcase,
  BsJournalBookmark,
  BsTrophy,
  BsPersonCircle,
  BsFire,
  BsRobot,
  BsPlayCircle,
  BsArrowRepeat,
  BsSearch,
  BsBell,
  BsChevronRight,
  BsStarFill,
  BsBarChartLine,
  BsShieldCheck,
  BsFileEarmarkText,
  BsCheckCircleFill,
  BsXCircleFill,
  BsPatchExclamationFill,
  BsBarChart,
} from 'react-icons/bs';

type TabType = 'overview' | 'analytics' | 'skills' | 'activity';

const heatmapData = [
  [3, 5, 2, 4, 6, 1, 0],
  [1, 4, 6, 3, 5, 2, 4],
  [5, 2, 4, 6, 1, 3, 5],
  [2, 6, 3, 5, 4, 2, 3],
];

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const weeks = ['W1', 'W2', 'W3', 'W4'];

const RadarChart: React.FC<{ skills: { label: string; val: number }[] }> = ({ skills }) => {
  const cx = 130, cy = 130, r = 100;
  const n = skills.length;
  const pts = (radius: number) =>
    skills.map((_, i) => {
      const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
      return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
    });

  const gridPts = (radius: number) => pts(radius).map(p => p.join(',')).join(' ');
  const valuePts = pts(r)
    .map(([x, y], i) => {
      const frac = skills[i].val / 100;
      return [cx + (x - cx) * frac, cy + (y - cy) * frac].join(',');
    })
    .join(' ');

  return (
    <svg viewBox="0 0 260 260" className={styles.radarSvg}>
      {[25, 50, 75, 100].map(pct => (
        <polygon
          key={pct}
          points={gridPts((r * pct) / 100)}
          fill="none"
          stroke="rgba(59,130,246,0.15)"
          strokeWidth="1"
        />
      ))}
      {pts(r).map(([x, y], i) => (
        <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(59,130,246,0.2)" strokeWidth="1" />
      ))}
      <polygon points={valuePts} fill="rgba(59,130,246,0.25)" stroke="#3b82f6" strokeWidth="2" />
      {pts(r).map(([x, y], i) => {
        const frac = skills[i].val / 100;
        const px = cx + (x - cx) * frac;
        const py = cy + (y - cy) * frac;
        return <circle key={i} cx={px} cy={py} r={4} fill="#3b82f6" />;
      })}
      {pts(r + 18).map(([x, y], i) => (
        <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="10" fill="#94a3b8">
          {skills[i].label}
        </text>
      ))}
    </svg>
  );
};

const LineChart: React.FC = () => {
  const data = [45, 58, 52, 70, 65, 80, 75, 88, 82, 91, 85, 95];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const w = 400, h = 160, pad = 20;
  const max = Math.max(...data);
  const xStep = (w - pad * 2) / (data.length - 1);
  const yScale = (v: number) => h - pad - ((v / max) * (h - pad * 2));
  const pathD = data.map((v, i) => `${i === 0 ? 'M' : 'L'}${pad + i * xStep},${yScale(v)}`).join(' ');
  const areaD = `${pathD} L${pad + (data.length - 1) * xStep},${h - pad} L${pad},${h - pad} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={styles.lineChartSvg}>
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[25, 50, 75, 100].map(v => (
        <line key={v} x1={pad} y1={yScale(v)} x2={w - pad} y2={yScale(v)} stroke="rgba(148,163,184,0.2)" strokeWidth="1" strokeDasharray="4 4" />
      ))}
      <path d={areaD} fill="url(#lineGrad)" />
      <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((v, i) => (
        <circle key={i} cx={pad + i * xStep} cy={yScale(v)} r="3.5" fill="#1e40af" stroke="#3b82f6" strokeWidth="1.5" />
      ))}
      {months.map((m, i) => (
        <text key={i} x={pad + i * xStep} y={h - 4} textAnchor="middle" fontSize="9" fill="#64748b">{m}</text>
      ))}
    </svg>
  );
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [animatedBars, setAnimatedBars] = useState(false);
  const [streak] = useState(5);

  useEffect(() => {
    const t = setTimeout(() => setAnimatedBars(true), 300);
    return () => clearTimeout(t);
  }, [activeTab]);

  useEffect(() => {
    setAnimatedBars(false);
    const t = setTimeout(() => setAnimatedBars(true), 300);
    return () => clearTimeout(t);
  }, [activeTab]);

  const skills = [
    { label: 'Argument\nClarity', val: 82 },
    { label: 'Legal\nKnowledge', val: 76 },
    { label: 'Evidence\nUsage', val: 69 },
    { label: 'Cross\nExam', val: 54 },
    { label: 'Case\nStrategy', val: 71 },
    { label: 'Objection\nHandling', val: 63 },
  ];

  const navItems: { id: TabType; icon: React.ReactNode; label: string }[] = [
    { id: 'overview', icon: <BsHouseDoor />, label: 'Overview' },
    { id: 'analytics', icon: <BsBarChartLine />, label: 'Analytics' },
    { id: 'skills', icon: <BsShieldCheck />, label: 'Skills' },
    { id: 'activity', icon: <BsClockHistory />, label: 'Activity' },
  ];

  return (
    <div className={styles.root}>
      {/* TOP NAVBAR */}
      <Navbar />

      <div className={styles.container}>
        {/* SIDEBAR */}
        <aside className={styles.sidebar}>
          <div className={styles.streakBox}>
            <BsFire className={styles.streakFire} />
            <div>
              <p className={styles.streakNum}>{streak} Days</p>
              <p className={styles.streakLabel}>Practice Streak</p>
            </div>
          </div>

          <nav className={styles.sideNav}>
            {navItems.map(item => (
              <button
                key={item.id}
                className={activeTab === item.id ? styles.activeNav : ''}
                onClick={() => setActiveTab(item.id)}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className={styles.quickActions}>
            <p className={styles.qaTitle}>Quick Actions</p>
            <button className={styles.qaBtn} onClick={() => navigate('/cases')}>
              <BsPlayCircle /> Start New Case
            </button>
            <button className={styles.qaBtn} onClick={() => navigate('/leaderboard')}>
              <BsBarChart /> View Rankings
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className={styles.content}>
          <header className={styles.header}>
            <div>
              <h1>
                {activeTab === 'overview' && 'Dashboard Overview'}
                {activeTab === 'analytics' && 'Performance Analytics'}
                {activeTab === 'skills' && 'Skill Breakdown'}
                {activeTab === 'activity' && 'Recent Activity'}
              </h1>
              <p>Welcome back. Here is your legal performance analysis.</p>
            </div>
            <div className={styles.headerRight}>
              <div className={styles.statPill}><BsStarFill className={styles.pillIcon} /> Rank #7 this week</div>
            </div>
          </header>

          {/* ─── OVERVIEW TAB ─── */}
          {activeTab === 'overview' && (
            <>
              {/* Stat Cards */}
              <div className={styles.statsRow}>
                {[
                  { label: 'Total Cases Played', val: '32', icon: <BsBriefcase />, color: '#3b82f6', sub: '+4 this week' },
                  { label: 'Win Rate', val: '68%', icon: <BsTrophy />, color: '#10b981', sub: '+3% vs last month' },
                  { label: 'Avg Score', val: '79/100', icon: <BsGraphUp />, color: '#f59e0b', sub: 'Best: Evidence Law' },
                  { label: 'Hours Practiced', val: '48h', icon: <BsCalendar4Week />, color: '#8b5cf6', sub: 'This month' },
                ].map((s, i) => (
                  <div key={i} className={styles.statCard} style={{ '--accent': s.color } as React.CSSProperties}>
                    <div className={styles.statIcon}>{s.icon}</div>
                    <div>
                      <p className={styles.statVal}>{s.val}</p>
                      <p className={styles.statLabel}>{s.label}</p>
                      <p className={styles.statSub}>{s.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.dashboardGrid}>
                <section className={styles.mainCol}>
                  {/* Progress Chart */}
                  <div className={styles.card}>
                    <h3><BsGraphUp /> Progress Over Time</h3>
                    <LineChart />
                  </div>

                  {/* AI Suggestion */}
                  <div className={`${styles.card} ${styles.aiCard}`}>
                    <div className={styles.aiHeader}>
                      <BsRobot className={styles.aiIcon} />
                      <div>
                        <h3>AI Suggestion</h3>
                        <p>Personalized recommendations based on your performance</p>
                      </div>
                    </div>
                    <div className={styles.aiBody}>
                      <p className={styles.aiMain}>Your cross-examination skills need improvement.</p>
                      <p className={styles.aiSub}>Recommended Practice:</p>
                      <ul>
                        <li>Witness questioning techniques</li>
                        <li>Evidence contradiction strategies</li>
                        <li>Objection handling drills</li>
                      </ul>
                    </div>
                    <button className={styles.practiceBtn} onClick={() => navigate('/cases')}><BsPlayCircle /> Start Practice</button>
                  </div>
                </section>

                <section className={styles.sideCol}>
                  {/* Donut Win Rate */}
                  <div className={`${styles.card} ${styles.centeredCard}`}>
                    <h3>Overall Win Rate</h3>
                    <div className={styles.donutChart}>
                      <span>68%</span>
                    </div>
                    <div className={styles.legend}>
                      <div className={styles.legendItem}><span style={{ color: '#3b82f6' }}>● Won</span><span>68%</span></div>
                      <div className={styles.legendItem}><span style={{ color: '#ef4444' }}>● Lost</span><span>20%</span></div>
                      <div className={styles.legendItem}><span style={{ color: '#f59e0b' }}>● Pending</span><span>12%</span></div>
                    </div>
                  </div>

                  {/* Heatmap */}
                  <div className={styles.card}>
                    <h3><BsCalendar4Week /> Practice Heatmap</h3>
                    <div className={styles.heatmapWrap}>
                      <div className={styles.heatDaysRow}>
                        {weekDays.map(d => <span key={d}>{d}</span>)}
                      </div>
                      {heatmapData.map((row, wi) => (
                        <div key={wi} className={styles.heatRow}>
                          <span className={styles.heatWeek}>{weeks[wi]}</span>
                          {row.map((val, di) => (
                            <div
                              key={di}
                              className={styles.heatCell}
                              style={{ opacity: val === 0 ? 0.1 : 0.2 + val * 0.13 }}
                              title={`${val} sessions`}
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                    <p className={styles.heatLegend}>Darker = more sessions</p>
                  </div>

                  {/* Achievements */}
                  <div className={styles.card}>
                    <h3><BsAward /> Achievements</h3>
                    <div className={styles.legend}>
                      <div className={styles.legendItem}><span>Cases Won this week</span><span>12</span></div>
                      <div className={styles.legendItem}><span>Total Hours Practiced</span><span>48h</span></div>
                      <div className={styles.legendItem}><span>Accuracy Level</span><span>High ✦</span></div>
                      <div className={styles.legendItem}><span>Best Section</span><span>Evidence Law</span></div>
                    </div>
                  </div>
                </section>
              </div>
            </>
          )}

          {/* ─── ANALYTICS TAB ─── */}
          {activeTab === 'analytics' && (
            <div className={styles.dashboardGrid}>
              <section className={styles.mainCol}>
                <div className={styles.card}>
                  <h3><BsGraphUp /> Win Rate Trend</h3>
                  <LineChart />
                </div>
                <div className={styles.card}>
                  <h3><BsBarChartLine /> Weekly Performance Score</h3>
                  {[
                    { day: 'Monday', val: 80 },
                    { day: 'Tuesday', val: 45 },
                    { day: 'Wednesday', val: 90 },
                    { day: 'Thursday', val: 70 },
                    { day: 'Friday', val: 85 },
                  ].map((item, i) => (
                    <div key={i} className={styles.barBox}>
                      <div className={styles.label}>
                        <span>{item.day}</span><span>{item.val}%</span>
                      </div>
                      <div className={styles.barBg}>
                        <div className={styles.barFill} style={{ width: animatedBars ? `${item.val}%` : '0%' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className={styles.sideCol}>
                <div className={styles.card}>
                  <h3>Key Metrics</h3>
                  {[
                    { label: 'Cases Attempted', val: 32, icon: <BsBriefcase />, color: '#3b82f6' },
                    { label: 'Win Rate', val: '68%', icon: <BsTrophy />, color: '#10b981' },
                    { label: 'Argument Score', val: '79/100', icon: <BsShieldCheck />, color: '#f59e0b' },
                    { label: 'Best Section', val: 'Evidence Law', icon: <BsStarFill />, color: '#8b5cf6' },
                    { label: 'Needs Work', val: 'Cross Exam', icon: <BsPatchExclamationFill />, color: '#ef4444' },
                  ].map((m, i) => (
                    <div key={i} className={styles.metricRow} style={{ '--mc': m.color } as React.CSSProperties}>
                      <span className={styles.metricIcon}>{m.icon}</span>
                      <span className={styles.metricLabel}>{m.label}</span>
                      <span className={styles.metricVal}>{m.val}</span>
                    </div>
                  ))}
                </div>

                <div className={`${styles.card} ${styles.centeredCard}`}>
                  <h3>Overall Win Rate</h3>
                  <div className={styles.donutChart}><span>68%</span></div>
                </div>
              </section>
            </div>
          )}

          {/* ─── SKILLS TAB ─── */}
          {activeTab === 'skills' && (
            <div className={styles.dashboardGrid}>
              <section className={styles.mainCol}>
                <div className={`${styles.card} ${styles.centeredCard}`}>
                  <h3>Skill Radar</h3>
                  <RadarChart skills={skills} />
                </div>

                <div className={styles.card}>
                  <h3><BsLightningCharge /> Priority Skills to Improve</h3>
                  {[
                    { label: 'Logical Deduction', val: 40, color: '#3b82f6', hint: 'Review Case Law #402' },
                    { label: 'Argument Speed', val: 65, color: '#3b82f6', hint: 'Practice oral submissions' },
                    { label: 'Evidence Analysis', val: 25, color: '#ef4444', hint: '⚠ High priority' },
                    { label: 'Cross Examination', val: 54, color: '#f59e0b', hint: 'Medium priority' },
                  ].map((item, i) => (
                    <div key={i} className={styles.barBox}>
                      <div className={styles.label}>
                        <span>{item.label} <small style={{ color: '#94a3b8', marginLeft: 8 }}>{item.hint}</small></span>
                        <span>{item.val}%</span>
                      </div>
                      <div className={styles.barBg}>
                        <div className={styles.barFill} style={{ width: animatedBars ? `${item.val}%` : '0%', background: item.color }} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className={styles.sideCol}>
                <div className={styles.card}>
                  <h3><BsShieldCheck /> AI Skill Breakdown</h3>
                  {skills.map((sk, i) => (
                    <div key={i} className={styles.barBox}>
                      <div className={styles.label}>
                        <span>{sk.label.replace('\n', ' ')}</span>
                        <span>{sk.val}%</span>
                      </div>
                      <div className={styles.barBg}>
                        <div
                          className={styles.barFill}
                          style={{
                            width: animatedBars ? `${sk.val}%` : '0%',
                            background: sk.val >= 75 ? '#10b981' : sk.val >= 60 ? '#f59e0b' : '#ef4444',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className={`${styles.card} ${styles.aiCard}`}>
                  <div className={styles.aiHeader}>
                    <BsRobot className={styles.aiIcon} />
                    <div><h3>AI Suggestion</h3></div>
                  </div>
                  <div className={styles.aiBody}>
                    <p className={styles.aiMain}>Focus on Cross Examination to unlock next rank.</p>
                    <ul>
                      <li>Witness questioning</li>
                      <li>Evidence contradictions</li>
                    </ul>
                  </div>
                  <button className={styles.practiceBtn} onClick={() => navigate('/cases')}><BsPlayCircle /> Start Practice</button>
                </div>
              </section>
            </div>
          )}

          {/* ─── ACTIVITY TAB ─── */}
          {activeTab === 'activity' && (
            <div className={styles.dashboardGrid}>
              <section className={styles.mainCol}>
                <div className={styles.card}>
                  <h3><BsClockHistory /> Recent Activity Feed</h3>
                  <div className={styles.activityList}>
                    {[
                      { case: 'State vs Sharma', verdict: 'Won', score: 82, type: 'Case', time: '2 mins ago', icon: <BsCheckCircleFill />, color: '#10b981' },
                      { case: 'Cross Examination Practice', verdict: 'Completed', score: 70, type: 'Practice', time: '1 hour ago', icon: <BsCheck2Circle />, color: '#3b82f6' },
                      { case: 'People vs Mathur', verdict: 'Lost', score: 48, type: 'Case', time: '3 hours ago', icon: <BsXCircleFill />, color: '#ef4444' },
                      { case: 'Evidence Law Drill', verdict: 'Completed', score: 91, type: 'Practice', time: 'Yesterday', icon: <BsCheck2Circle />, color: '#10b981' },
                      { case: 'Corp vs Mehta Ltd', verdict: 'Won', score: 88, type: 'Case', time: 'Yesterday', icon: <BsCheckCircleFill />, color: '#10b981' },
                      { case: 'Argument Speed Drill', verdict: 'Completed', score: 65, type: 'Practice', time: '2 days ago', icon: <BsCheck2Circle />, color: '#f59e0b' },
                    ].map((act, i) => (
                      <div key={i} className={styles.activityItem}>
                        <div className={styles.actIcon} style={{ color: act.color }}>{act.icon}</div>
                        <div className={styles.actInfo}>
                          <div className={styles.actTop}>
                            <span className={styles.actCase}>{act.case}</span>
                            <span className={styles.actScore}>Score: {act.score}%</span>
                          </div>
                          <div className={styles.actBottom}>
                            <span className={`${styles.actVerdict} ${act.verdict === 'Won' ? styles.verdictWon : act.verdict === 'Lost' ? styles.verdictLost : styles.verdictDone}`}>
                              {act.type === 'Case' ? `⚖️ Verdict: ${act.verdict}` : `📊 ${act.verdict}`}
                            </span>
                            <span className={styles.actTime}>{act.time}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section className={styles.sideCol}>
                <div className={styles.card}>
                  <h3><BsCalendar4Week /> Courtroom Heatmap</h3>
                  <div className={styles.heatmapWrap}>
                    <div className={styles.heatDaysRow}>
                      {weekDays.map(d => <span key={d}>{d}</span>)}
                    </div>
                    {heatmapData.map((row, wi) => (
                      <div key={wi} className={styles.heatRow}>
                        <span className={styles.heatWeek}>{weeks[wi]}</span>
                        {row.map((val, di) => (
                          <div
                            key={di}
                            className={styles.heatCell}
                            style={{ opacity: val === 0 ? 0.08 : 0.2 + val * 0.13 }}
                            title={`${val} sessions`}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                  <p className={styles.heatLegend}>Darker = more practice sessions</p>
                </div>

                <div className={styles.card}>
                  <h3><BsFire /> Streak System</h3>
                  <div className={styles.streakCard}>
                    <BsFire className={styles.streakBigIcon} />
                    <p className={styles.streakBig}>{streak} Days</p>
                    <p className={styles.streakSub}>Current Practice Streak</p>
                    <div className={styles.streakPills}>
                      {Array.from({ length: 7 }, (_, i) => (
                        <div key={i} className={`${styles.streakDot} ${i < streak ? styles.streakDotActive : ''}`} />
                      ))}
                    </div>
                    <p className={styles.streakNext}>🏅 Next reward in 2 days</p>
                  </div>
                </div>
              </section>
            </div>
          )}

          
        </main>
      </div>
    </div>
  );
};

export default Dashboard;