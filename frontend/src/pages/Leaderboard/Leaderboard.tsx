import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styled, { createGlobalStyle, keyframes } from "styled-components";
import Navbar from "../../components/Navbar/Navbar";

/* ─── GLOBAL FONTS ─── */
const GlobalFonts = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=EB+Garamond:ital,wght@0,400;0,500;1,400&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
`;

/* ─── DATA ─── */
const dummyData = [
  { rank: 1,  name: "John Doe",      score: 1500, casesFought: 250, wins: 45, accuracy: 95, time: "120h", initial: "JD" },
  { rank: 2,  name: "Jane Smith",    score: 1400, casesFought: 248, wins: 42, accuracy: 95, time: "120h", initial: "JS" },
  { rank: 3,  name: "Alice Johnson", score: 1350, casesFought: 245, wins: 38, accuracy: 95, time: "10h",  initial: "AJ" },
  { rank: 4,  name: "Bob Brown",     score: 1300, casesFought: 42,  wins: 35, accuracy: 91, time: "98h",  initial: "BB" },
  { rank: 5,  name: "Charlie Davis", score: 1250, casesFought: 40,  wins: 32, accuracy: 88, time: "85h",  initial: "CD" },
  { rank: 6,  name: "Diana Evans",   score: 1200, casesFought: 38,  wins: 30, accuracy: 85, time: "74h",  initial: "DE" },
  { rank: 7,  name: "Ethan Foster",  score: 1150, casesFought: 35,  wins: 28, accuracy: 83, time: "66h",  initial: "EF" },
  { rank: 8,  name: "Fiona Garcia",  score: 1100, casesFought: 33,  wins: 26, accuracy: 81, time: "60h",  initial: "FG" },
  { rank: 9,  name: "George Harris", score: 1050, casesFought: 30,  wins: 24, accuracy: 80, time: "54h",  initial: "GH" },
  { rank: 10, name: "Hannah Ingram", score: 1000, casesFought: 28,  wins: 22, accuracy: 79, time: "48h",  initial: "HI" },
];

const rankStyle = (rank: number) => {
  if (rank === 1) return { bg: "linear-gradient(135deg,#1e3a8a,#2563eb)", color: "#fff" };
  if (rank === 2) return { bg: "linear-gradient(135deg,#3b82f6,#60a5fa)", color: "#fff" };
  if (rank === 3) return { bg: "linear-gradient(135deg,#60a5fa,#93c5fd)", color: "#1e3a8a" };
  return { bg: "#eff6ff", color: "#2563eb" };
};

const avatarBg = (rank: number) => {
  if (rank === 1) return "linear-gradient(135deg,#1e3a8a,#2563eb)";
  if (rank === 2) return "linear-gradient(135deg,#2563eb,#3b82f6)";
  if (rank === 3) return "linear-gradient(135deg,#3b82f6,#60a5fa)";
  return "linear-gradient(135deg,#60a5fa,#93c5fd)";
};

/* ─── ICONS ─── */

const ChevronDown = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const ChevronUp = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="18 15 12 9 6 15" />
  </svg>
);

const Plus = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const Leaderboard = () => {
  const [expanded, setExpanded] = useState<number | null>(null);

  const toggle = (rank: number) =>
    setExpanded((p) => (p === rank ? null : rank));

  const totalCases = dummyData.reduce((a, u) => a + u.casesFought, 0);
  const totalWins  = dummyData.reduce((a, u) => a + u.wins, 0);
  const avgAccuracy = Math.round(
    dummyData.reduce((a, u) => a + u.accuracy, 0) / dummyData.length
  );

  return (
    <>
      <Navbar />
      <GlobalFonts />

      <Container>

        {/* HERO */}
        <HeroBanner>
          <HeroBannerInner>
            <HeroLeft>
              
              <HeroTitle>Leaderboard</HeroTitle>
              <HeroSub>
                Compete with the best legal minds and climb the ranks!
              </HeroSub>

              <HeroStats>
                <HeroStat>
                  <HeroStatNum>{dummyData.length}</HeroStatNum>
                  <HeroStatLabel>Active Players</HeroStatLabel>
                </HeroStat>

                <HeroStatDivider />

                <HeroStat>
                  <HeroStatNum>
                    {totalCases.toLocaleString()}
                  </HeroStatNum>
                  <HeroStatLabel>Cases Fought</HeroStatLabel>
                </HeroStat>

                <HeroStatDivider />

                <HeroStat>
                  <HeroStatNum>{avgAccuracy}%</HeroStatNum>
                  <HeroStatLabel>Avg Accuracy</HeroStatLabel>
                </HeroStat>
              </HeroStats>
            </HeroLeft>
            <HeroRight>

  {/* 2nd Place */}
  <PodiumItem>
    <PodiumAvatar style={{ background: avatarBg(2) }}>
      {dummyData[1].initial}
    </PodiumAvatar>

    <PodiumName>
      {dummyData[1].name}
    </PodiumName>

    <PodiumScore>
      {dummyData[1].score} pts
    </PodiumScore>

    <PodiumBlock $rank={2}>
      2nd
    </PodiumBlock>
  </PodiumItem>

  {/* 1st Place */}
  <PodiumItem $center>
    <CrownEmoji>👑</CrownEmoji>

    <PodiumAvatar
      $center
      style={{ background: avatarBg(1) }}
    >
      {dummyData[0].initial}
    </PodiumAvatar>

    <PodiumName $center>
      {dummyData[0].name}
    </PodiumName>

    <PodiumScore>
      {dummyData[0].score} pts
    </PodiumScore>

    <PodiumBlock $rank={1} $center>
      1st
    </PodiumBlock>
  </PodiumItem>

  {/* 3rd Place */}
  <PodiumItem>
    <PodiumAvatar style={{ background: avatarBg(3) }}>
      {dummyData[2].initial}
    </PodiumAvatar>

    <PodiumName>
      {dummyData[2].name}
    </PodiumName>

    <PodiumScore>
      {dummyData[2].score} pts
    </PodiumScore>

    <PodiumBlock $rank={3}>
      3rd
    </PodiumBlock>
  </PodiumItem>

</HeroRight>
          </HeroBannerInner>
        </HeroBanner>

        {/* ── MAIN CONTENT: two-column layout ── */}
        <MainContent>

          {/* LEFT: leaderboard list */}
          <LeftCol>
            <SectionLabel>All Rankings</SectionLabel>
            <Card
              as={motion.div}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1 }}
            >
              {dummyData.map((user, i) => {
                const rs = rankStyle(user.rank);
                const isExpanded = expanded === user.rank;
                const isTop3 = user.rank <= 3;
                const winRate = Math.round((user.wins / user.casesFought) * 100);

                return (
                  <React.Fragment key={user.rank}>
                    <Row
                      $expanded={isExpanded}
                      as={motion.div}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.35, delay: 0.04 * i }}
                      onClick={() => toggle(user.rank)}
                    >
                      <RankBadge style={{ background: rs.bg, color: rs.color }}>
                        #{user.rank}
                      </RankBadge>

                      <Avatar style={{ background: avatarBg(user.rank) }}>
                        {user.initial}
                      </Avatar>

                      

                      <NameCol>
                        <UserName>{user.name}</UserName>
                        <WinRateBar>
                          <WinRateFill style={{ width: `${winRate}%` }} />
                        </WinRateBar>
                        <WinRateLabel>{winRate}% win rate · {user.wins} wins</WinRateLabel>
                      </NameCol>

                      <Spacer />

                      <ScoreCol>
                        <Score>{user.score.toLocaleString()}</Score>
                        <ScoreSub>points</ScoreSub>
                      </ScoreCol>

                      <ExpandBtn $expanded={isExpanded}>
                        {isExpanded ? <ChevronUp /> : isTop3 ? <ChevronDown /> : <Plus />}
                      </ExpandBtn>
                    </Row>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          key="detail"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.26, ease: "easeInOut" }}
                          style={{ overflow: "hidden" }}
                        >
                          <ExpandedPanel>
                            {[
                              { label: "Accuracy",     value: `${user.accuracy}%` },
                              { label: "Cases Fought", value: user.casesFought },
                              { label: "Wins",         value: user.wins },
                              { label: "Time Active",  value: user.time },
                              { label: "Win Rate",     value: `${winRate}%` },
                            ].map(s => (
                              <StatPill key={s.label}>
                                <StatPillLabel>{s.label}</StatPillLabel>
                                <StatPillValue>{s.value}</StatPillValue>
                              </StatPill>
                            ))}
                          </ExpandedPanel>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {i < dummyData.length - 1 && <RowDivider />}
                  </React.Fragment>
                );
              })}
            </Card>
          </LeftCol>

          {/* RIGHT: sidebar */}
          <RightCol>

            {/* Your rank card */}
            <SectionLabel>Your Standing</SectionLabel>
            <YourRankCard
              as={motion.div}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.2 }}
            >
              <YourRankTop>
                <YourAvatar>YO</YourAvatar>
                <YourInfo>
                  <YourName>You</YourName>
                  <YourRankNum>#7 this week</YourRankNum>
                </YourInfo>
              </YourRankTop>
              <YourDivider />
              <YourStats>
                {[
                  { label: "Your Score",  value: "980" },
                  { label: "Cases",       value: "22"  },
                  { label: "Win Rate",    value: "72%" },
                ].map(s => (
                  <YourStat key={s.label}>
                    <YourStatVal>{s.value}</YourStatVal>
                    <YourStatLabel>{s.label}</YourStatLabel>
                  </YourStat>
                ))}
              </YourStats>
              <ProgressSection>
                <ProgressLabel>
                  <span>Progress to #6</span>
                  <span>980 / 1150</span>
                </ProgressLabel>
                <ProgressTrack>
                  <ProgressFill style={{ width: "85%" }} />
                </ProgressTrack>
              </ProgressSection>
              <ChallengeBtn>⚡ Challenge Top Players</ChallengeBtn>
            </YourRankCard>

            {/* Top stats summary */}
            <SectionLabel style={{ marginTop: "24px" }}>This Season</SectionLabel>
            <SideCard
              as={motion.div}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.3 }}
            >
              {[
                {
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="2" x2="12" y2="22"/>
                      <line x1="3" y1="7" x2="21" y2="7"/>
                      <path d="M6 7L3 14a3 3 0 0 0 6 0L6 7z"/>
                      <path d="M18 7l-3 7a3 3 0 0 0 6 0L18 7z"/>
                      <line x1="8" y1="22" x2="16" y2="22"/>
                    </svg>
                  ),
                  label: "Total Cases Argued", value: totalCases.toLocaleString()
                },
                {
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                  ),
                  label: "Total Wins", value: totalWins.toLocaleString()
                },
                {
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <circle cx="12" cy="12" r="3"/>
                      <line x1="12" y1="2" x2="12" y2="5"/>
                      <line x1="12" y1="19" x2="12" y2="22"/>
                      <line x1="2" y1="12" x2="5" y2="12"/>
                      <line x1="19" y1="12" x2="22" y2="12"/>
                    </svg>
                  ),
                  label: "Avg Accuracy", value: `${avgAccuracy}%`
                },
                {
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="8" r="6"/>
                      <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
                    </svg>
                  ),
                  label: "Top Score", value: "1,500 pts"
                },
              ].map((s, i) => (
                <SideStatRow key={s.label} $last={i === 3}>
                  <SideStatIcon>{s.icon}</SideStatIcon>
                  <SideStatLabel>{s.label}</SideStatLabel>
                  <SideStatValue>{s.value}</SideStatValue>
                </SideStatRow>
              ))}
            </SideCard>

            {/* Recent activity */}
            <SectionLabel style={{ marginTop: "24px" }}>Recent Activity</SectionLabel>
            <SideCard
              as={motion.div}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.4 }}
            >
              {[
                { name: "John Doe",   action: "won a case",        time: "2m ago",  up: true  },
                { name: "Jane Smith", action: "climbed to #2",     time: "14m ago", up: true  },
                { name: "Bob Brown",  action: "lost a case",       time: "32m ago", up: false },
                { name: "Diana Evans",action: "argued 3 new cases",time: "1h ago",  up: true  },
              ].map((a, i) => (
                <ActivityRow key={i} $last={i === 3}>
                  <ActivityDot $up={a.up} />
                  <ActivityText>
                    <ActivityName>{a.name}</ActivityName>
                    <ActivityDesc>{a.action}</ActivityDesc>
                  </ActivityText>
                  <ActivityTime>{a.time}</ActivityTime>
                </ActivityRow>
              ))}
            </SideCard>

          </RightCol>
        </MainContent>

        {/* ── FOOTER ── */}
        <Footer>
          <LeftFooter>© 2026 Adjournment AI. All rights reserved.</LeftFooter>
          <RightFooter>Terms of Service | Privacy Policy | Help Center | Contact Us</RightFooter>
        </Footer>

      </Container>
    </>
  );
};

export default Leaderboard;

/* ══════════════════════════════════════════
   STYLES
══════════════════════════════════════════ */

const Container = styled.div`
  min-height: 100vh;
  background-color: #eff6ff;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  display: flex;
  flex-direction: column;
`;

/* ── Hero banner ── */
const HeroBanner = styled.div`
  background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #2563eb 100%);
  padding: 36px 32px 32px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
    background-size: 40px 40px;
    pointer-events: none;
  }
`;

const HeroBannerInner = styled.div`
  max-width: 1200px;
  margin: 0 auto;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 40px;

  position: relative;
  z-index: 1;

  @media (max-width: 900px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 24px;
  }

  @media (max-width: 600px) {
    gap: 18px;
  }
`;

const HeroLeft = styled.div`display:flex;flex-direction:column;gap:12px;`;

const HeroTitle = styled.h1`
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 2.2rem;
  font-weight: 700;
  color: #ffffff;

  @media (max-width: 768px) {
    font-size: 1.8rem;
  }

  @media (max-width: 480px) {
    font-size: 1.5rem;
  }
`;

const HeroSub = styled.p`
  font-family: 'EB Garamond', Georgia, serif;
  font-size: 1rem;
  font-style: italic;
  color: #bfdbfe;
`;

const HeroStats = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-top: 8px;
`;

const HeroStat = styled.div`display:flex;flex-direction:column;gap:2px;`;
const HeroStatNum = styled.span`
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 1.6rem;
  font-weight: 700;
  color: #fff;
`;
const HeroStatLabel = styled.span`
  font-size: 11px;
  color: #93c5fd;
  text-transform: uppercase;
  letter-spacing: 1px;
`;
const HeroStatDivider = styled.div`width:1px;height:36px;background:rgba(255,255,255,0.15);`;

/* ── Mini podium ── */
const HeroRight = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 12px;
  flex-shrink: 0;

  @media (max-width: 900px) {
    width: 100%;
    justify-content: center;
  }

  @media (max-width: 600px) {
    gap: 8px;
  }
`;

const PodiumItem = styled.div<{ $center?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  transform: ${p => p.$center ? "translateY(-12px)" : "none"};
`;

const CrownEmoji = styled.div`font-size: 20px; line-height:1;`;

const PodiumAvatar = styled.div<{ $center?: boolean }>`
  width: ${p => p.$center ? "52px" : "42px"};
  height: ${p => p.$center ? "52px" : "42px"};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'EB Garamond', Georgia, serif;
  font-size: ${p => p.$center ? "14px" : "12px"};
  font-weight: 700;
  color: #fff;
  border: 2px solid rgba(255,255,255,0.3);
  box-shadow: 0 4px 16px rgba(0,0,0,0.3);
`;

const PodiumName = styled.div<{ $center?: boolean }>`
  font-family: 'EB Garamond', Georgia, serif;
  font-size: ${p => p.$center ? "13px" : "11px"};
  color: #e2e8f0;
  font-weight: 500;
`;

const PodiumScore = styled.div`
  font-size: 10px;
  color: #93c5fd;
`;

const PodiumBlock = styled.div<{ $rank: number; $center?: boolean }>`
  background: ${p =>
  p.$rank === 1 ? "linear-gradient(135deg, #F6D365 0%, #FDA085 100%)" : // Warm Gold
  p.$rank === 2 ? "linear-gradient(135deg, #BDC3C7 0%, #2C3E50 100%)" : // Cool Silver
  "linear-gradient(135deg, #D1913C 0%, #FFD194 100%)"};                // Soft Bronze
  color: #fff;
  border-radius: 6px 6px 0 0;
  width: ${p => p.$center ? "72px" : "60px"};
  height: ${p => p.$center ? "44px" : "32px"};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  margin-top: 6px;
`;

/* ── Main content ── */
const MainContent = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 24px;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 28px 24px 40px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const LeftCol = styled.div`display:flex;flex-direction:column;gap:10px;`;
const RightCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;

  @media (max-width: 900px) {
    margin-top: 10px;
  }
`;

const SectionLabel = styled.div`
  font-family: 'EB Garamond', Georgia, serif;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  color: #64748b;
  margin-bottom: 8px;
`;

/* ── Leaderboard card ── */
const Card = styled.div`
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 0 0 1px rgba(30,58,138,0.08), 0 4px 6px rgba(15,23,42,0.06), 0 16px 48px rgba(15,23,42,0.08);
  overflow: hidden;
  position: relative;
  &::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, #1e3a8a, #3b82f6, #60a5fa, #3b82f6, #1e3a8a);
    z-index: 1;
  }
`;

/* ── Row ── */
const Row = styled.div<{ $expanded?: boolean }>`
  display: flex;
  align-items: center;

  padding: 13px 18px;

  cursor: pointer;

  transition: background 0.18s;

  background: ${p =>
    p.$expanded
      ? "#eff6ff"
      : "transparent"};

  &:hover {
    background: #f8faff;
  }

  @media (max-width: 600px) {
    padding: 10px 12px;
    gap: 6px;
  }
`;

const RankBadge = styled.div`
  min-width: 42px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'EB Garamond', Georgia, serif;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
`;

const Avatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  margin: 0 12px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'EB Garamond', Georgia, serif;
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  box-shadow: 0 2px 6px rgba(30,58,138,0.2);
`;

const NameCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;

  flex-shrink: 0;
  min-width: 130px;

  @media (max-width: 600px) {
    min-width: auto;
    flex: 1;
  }
`;

const UserName = styled.span`
  font-family: 'EB Garamond', Georgia, serif;
  font-size: 15px;
  font-weight: 500;
  color: #0f172a;
`;

const WinRateBar = styled.div`
  width: 100%;
  height: 3px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
`;

const WinRateFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  border-radius: 4px;
  transition: width 0.6s ease;
`;

const WinRateLabel = styled.span`
  font-family: 'EB Garamond', Georgia, serif;
  font-size: 10.5px;
  color: #94a3b8;
  font-style: italic;
`;

const Spacer = styled.div`flex:1;`;

const ScoreCol = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-right: 10px;
`;

const Score = styled.span`
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 16px;
  font-weight: 700;
  color: #2563eb;
  white-space: nowrap;
`;

const ScoreSub = styled.span`
  font-size: 10px;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ExpandBtn = styled.button<{ $expanded?: boolean }>`
  background: transparent;
  border: none;
  color: ${p => p.$expanded ? "#2563eb" : "#94a3b8"};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 5px;
  border-radius: 6px;
  transition: color 0.2s, background 0.2s;
  &:hover { background: #dbeafe; color: #2563eb; }
`;

const RowDivider = styled.div`height:1px;background:#f1f5f9;margin:0 18px;`;

const ExpandedPanel = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 18px 16px 82px;
  background: #f8faff;
  border-top: 1px solid #dbeafe;
`;

const StatPill = styled.div`
  background: #fff;
  border: 1px solid #dbeafe;
  border-radius: 9px;
  padding: 7px 14px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 100px;
`;

const StatPillLabel = styled.span`
  font-family: 'EB Garamond', Georgia, serif;
  font-size: 10px;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.8px;
`;

const StatPillValue = styled.span`
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
`;

/* ── Sidebar: Your rank ── */
const YourRankCard = styled.div`
  background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(30,58,138,0.25);
  margin-bottom: 0;
`;

const YourRankTop = styled.div`display:flex;align-items:center;gap:12px;margin-bottom:14px;`;

const YourAvatar = styled.div`
  width: 44px; height: 44px; border-radius: 50%;
  background: rgba(255,255,255,0.2);
  border: 2px solid rgba(255,255,255,0.35);
  display: flex; align-items: center; justify-content: center;
  font-family: 'EB Garamond', Georgia, serif;
  font-size: 13px; font-weight: 700; color: #fff;
`;

const YourInfo = styled.div`display:flex;flex-direction:column;gap:2px;`;
const YourName = styled.div`font-family:'Playfair Display',serif;font-size:16px;font-weight:700;color:#fff;`;
const YourRankNum = styled.div`font-size:12px;color:#bfdbfe;font-style:italic;font-family:'EB Garamond',serif;`;

const YourDivider = styled.div`height:1px;background:rgba(255,255,255,0.15);margin-bottom:14px;`;

const YourStats = styled.div`display:flex;justify-content:space-between;margin-bottom:16px;`;
const YourStat = styled.div`display:flex;flex-direction:column;align-items:center;gap:2px;`;
const YourStatVal = styled.div`font-family:'Playfair Display',serif;font-size:18px;font-weight:700;color:#fff;`;
const YourStatLabel = styled.div`font-size:10px;color:#bfdbfe;text-transform:uppercase;letter-spacing:0.8px;`;

const ProgressSection = styled.div`margin-bottom:14px;`;
const ProgressLabel = styled.div`
  display:flex;justify-content:space-between;
  font-size:11px;color:#bfdbfe;margin-bottom:6px;
  font-family:'EB Garamond',serif;font-style:italic;
`;
const ProgressTrack = styled.div`height:6px;background:rgba(255,255,255,0.15);border-radius:4px;overflow:hidden;`;
const ProgressFill = styled.div`
  height:100%;
  background:linear-gradient(90deg,#60a5fa,#fff);
  border-radius:4px;
`;

const ChallengeBtn = styled.button`
  width: 100%;
  padding: 10px;
  border: 1.5px solid rgba(255,255,255,0.3);
  border-radius: 10px;
  background: rgba(255,255,255,0.1);
  color: #fff;
  font-family: 'EB Garamond', Georgia, serif;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
  &:hover { background: rgba(255,255,255,0.2); }
`;

/* ── Sidebar generic card ── */
const SideCard = styled.div`
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 0 0 1px rgba(30,58,138,0.08), 0 4px 20px rgba(15,23,42,0.07);
  overflow: hidden;
`;

const SideStatRow = styled.div<{ $last?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: ${p => p.$last ? "none" : "1px solid #f1f5f9"};
`;

const SideStatIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: #eff6ff;
  border-radius: 7px;
  flex-shrink: 0;
`;
const SideStatLabel = styled.span`
  flex: 1;
  font-family: 'EB Garamond', Georgia, serif;
  font-size: 14px;
  color: #475569;
`;
const SideStatValue = styled.span`
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 15px;
  font-weight: 700;
  color: #1e3a8a;
`;

/* ── Activity ── */
const ActivityRow = styled.div<{ $last?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 16px;
  border-bottom: ${p => p.$last ? "none" : "1px solid #f1f5f9"};
`;

const ActivityDot = styled.div<{ $up?: boolean }>`
  width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
  background: ${p => p.$up ? "#22c55e" : "#ef4444"};
`;
const ActivityText = styled.div`flex:1;display:flex;flex-direction:column;gap:1px;`;
const ActivityName = styled.span`
  font-family:'EB Garamond',serif;font-size:13.5px;font-weight:500;color:#0f172a;
`;
const ActivityDesc = styled.span`
  font-family:'EB Garamond',serif;font-size:11.5px;color:#64748b;font-style:italic;
`;
const ActivityTime = styled.span`
  font-size:10.5px;color:#94a3b8;white-space:nowrap;
`;

/* ── Footer ── */
const Footer = styled.footer`
  padding: 14px 24px;

  background: linear-gradient(
    90deg,
    #0f172a 0%,
    #1e3a8a 100%
  );

  display: flex;
  justify-content: space-between;

  font-size: 12px;
  color: #e2e8f0;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 6px;
    text-align: center;
  }
`;
const LeftFooter = styled.div``;
const RightFooter = styled.div``;